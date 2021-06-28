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

	const downloadFile = () => {
		const result = FileHelper.generateResult();
		if (result === undefined) {
			alert('Noch nicht simuliert');
			return;
		}

		const blob = new Blob([JSON.stringify(result)]);

		const href = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = href;
		link.download = 'result.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const simulate = () => {
		const donefn = () => {
			alert('Simulation abgeschlossen');
		};
		FileHelper.simulateNetwork(donefn);
	};

	return (
		<div style={{ textAlign: 'center', alignContent: 'center' }}>
			<form>
				<input type={'file'} onChange={onChangeFile} />
			</form>
			<button onClick={simulate}>Simulieren</button>
			<button onClick={downloadFile}>Ergebnis herunterladen</button>
		</div>
	);
};

export default App;
