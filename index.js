import { argv } from 'process';
import fetch from 'node-fetch';
import fs from 'fs';
import screenshot from 'screenshot-desktop';
const auth = argv[2];
const folder = argv[3];

function checkUniq(name) {
  try {
    const exists = fs.existsSync(`${name}.txt`);
    console.log('Exists: ', exists);
  } catch (e) {
    console.log(e);
  }
}
function makeUniq() {
  let id = Date.now();
  if (checkUniq(id)) makeUniq();
  else return id;
}
async function vision() {
  let id = makeUniq();

  let scrn = await screenshot({filename: `${id}.png`,format: 'png',linuxLibrary: 'scrot'})
    .then(() => {
     /* fs.writeFile(`${id}.png`, img, Buffer, function (err) {
        console.log(err); 
      });*/
      return fs.readFileSync(`${id}.png`);
    })
    .catch((err) => {
      console.log(err);
    });

  let encoded = Buffer.from(scrn).toString('base64');

  let response = await fetch('https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${auth}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      folderId: `${folder}`,
      analyze_specs: [
        {
          content: encoded,
          features: [
            {
              type: 'TEXT_DETECTION',
              text_detection_config: {
                language_codes: ['*'],
              },
            },
          ],
        },
      ],
    }),
  });

  let result = await response.text();
  fs.writeFile(`${id}.txt`, result, 'utf8', function (err) {
    console.log(err);
  });
}

vision();
