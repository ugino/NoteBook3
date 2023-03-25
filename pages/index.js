import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';
import { UilHeart } from '@iconscout/react-unicons';


const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  { ssr: false }
);

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [notes, setNotes] = useLocalStorage('notes', []);
  const [newNote, setNewNote] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleEditorChange = (content, editor) => {
    setNewNote(content);
  };

  const handleTitleChange = (event) => {
    setNewTitle(event.target.value);
  };

  const handleButtonClick = () => {
    if (newNote.trim() !== '' && newTitle.trim() !== '') {
      setNotes([...notes, { title: newTitle, note: newNote }]);
      setNewTitle('');
      setNewNote('');
    }
  };

  const handleRemoveButtonClick = (index, event) => {
    event.stopPropagation();
    const newNotes = [...notes];
    newNotes.splice(index, 1);
    setNotes(newNotes);
  };

  const handleNoteClick = (event, note) => {
    event.preventDefault();
    setSelectedNote(note.title);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.appLogo}>
          NoteBook
          <UilHeart width={18} className={styles.logoIcon}/>
        </div>
        <div className={styles.sidebarNotesList}>
        <p className={styles.noteHeaderTitle}>Select Note</p>

        {notes.map((note, index) => (
          <div key={index} className={styles.sidebarItem} onClick={(event) => handleNoteClick(event, note)}>
            {note.title}
          </div>
        ))}
        </div>
      </div>
      <div className={styles.main}>
        {/* <div className={styles.headerBox}>
          <p className={styles.titleP}>Todo App</p>
        </div> */}
        <div className={styles.inputDiv}>
          <input className={styles.titleInput} type="text" placeholder="Title" value={newTitle} onChange={handleTitleChange} />
          <Editor
            apiKey="3s639nkdq31n86l81eye1orgt165wokgf4wtdkjljs9sdnld"
            init={{
              height: 870,
              menubar: true,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | code | help'
            }}
            value={newNote}
            onEditorChange={handleEditorChange}
            styles={{ border: 'transparent' }}

          />
          <button className={styles.submitNote} onClick={handleButtonClick}>Add Note</button>
        </div>
        <div className={styles.noteDisplay}>
          {selectedNote ? (
            notes.map((note, index) => (
              note.title === selectedNote && (
                <div key={index} className={styles.noteDiv}>
                  <h3>{note.title}</h3>
                  <div className="note-body" dangerouslySetInnerHTML={{ __html: note.note }} />
                  <button
                    className={styles.removeNote}
                    onClick={(event) => handleRemoveButtonClick(index, event)}
                  >
                    Delete Note
                  </button>
                </div>
              )
            ))
          ) : (
            <p className={styles.notePlaceholder}>Select a note from the sidebar</p>
          )}
        </div>
      </div>
    </div>
  );
}