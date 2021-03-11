import React from 'react';
import './App.css';
import FileHelper from './Utils/FileHelper';

const App: React.FC<{}> = () => {
  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files)
      FileHelper.parseFile(event.currentTarget.files[0])
        .then((value) => {
          console.log(value);
        })
        .catch((error) => {
          handleFileError();
        });
  };

  const handleFileError = () => {
    alert('File in incorrect format');
  };

  return (
    <form>
      <input type={'file'} onChange={onChangeFile} />
    </form>
  );
};

export default App;
