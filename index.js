import fetch from 'node-fetch';
import fs from 'fs';
import screenshot from 'screenshot-desktop';
function makeid(length) {
  //Генератор ид, для уникальных имен.Стырил на стаковерфлоу, так как поленился написать вручную.
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function checkUniq(name) {
  try {
    const exists = fs.existsSync(`${name}.txt`);
    console.log('Exists: ', exists);
  } catch (e) {
    console.log(e);
  }
}
function makeUniq() {
  let id = makeid(9);
  if (checkUniq(id)) makeUniq();
  else return id;
}
async function vision() {
  let id = makeUniq();

  let scrn = await screenshot()
    .then((img) => {
      fs.writeFile(`${id}.jpg`, img, Buffer, function (err) {
        console.log(err);
      });
      return img;
    })
    .catch((err) => {
      console.log(err);
    });

  let encoded = Buffer.from(scrn).toString('base64');

  let response = await fetch('https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Api-Key AQVNyG8KKUYJzaAVX_sHfkffOyGk9Hig6fUi7Mky',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      folderId: 'b1gjelpacu3it75nd6nq',
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
