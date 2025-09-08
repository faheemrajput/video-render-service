// render.js  – super-simple video merger
const express = require('express');
const multer  = require('multer');        // handles file uploads
const ffmpeg  = require('fluent-ffmpeg');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');
const app     = express();
app.use(cors());
const upload  = multer({ dest: 'uploads/' });

// 1. receive picture + video + coordinates
app.post('/make-video', upload.fields([
  { name: 'template', maxCount: 1 },
  { name: 'reel',     maxCount: 1 }
]), async (req, res) => {
  const { x, y, width, height } = req.body;
  const picPath  = req.files.template[0].path;
  const vidPath  = req.files.reel[0].path;
  const outPath  = `uploads/${Date.now()}.mp4`;

  ffmpeg()
    .input(picPath)
    .input(vidPath)
    .complexFilter([
      `[1:v]scale=${width}:${height}[scaled]`,
      `[0:v][scaled]overlay=${x}:${y}:enable='between(t,0,15)'`
    ])
    .outputOptions(['-c:a copy', '-movflags faststart'])
    .save(outPath)
    .on('end', () => {
      res.download(outPath, 'finished.mp4', err => {
        // tidy up
        [picPath, vidPath, outPath].forEach(p => fs.unlinkSync(p));
      });
    })
    .on('error', err => res.status(500).send(err.message));
});

app.listen(process.env.PORT || 3000, () => console.log('Render service ready'));
