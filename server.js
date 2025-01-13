const express = require('express');
const multer = require('multer');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
const speechClient = new SpeechClient({ keyFilename: 'path/to/your/service-account-file.json' });

app.post('/upload', upload.single('audio'), async (req, res) => {
  const filePath = req.file.path;

  const audio = {
    content: fs.readFileSync(filePath).toString('base64'),
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    res.send({ transcription: transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).send('Error transcribing audio');
  } finally {
    fs.unlinkSync(filePath); // Clean up uploaded file
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
