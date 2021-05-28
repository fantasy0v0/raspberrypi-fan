const gpio = require("gpio");
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

async function main() {
  let gpio14 = await setup(14, gpio.DIRECTION.OUT);
  let mode = true;
  do {
    let buff = await readFile('/sys/class/thermal/thermal_zone0/temp');
    let temp = parseFloat(buff.toString()) / 1000;

    if (mode) {
      if (temp < 41) {
        await set(gpio14, 1);
        await setDirection(gpio14, gpio.DIRECTION.IN);
        mode = false;
        console.log(`当前温度: ${temp}, 关闭风扇 ${new Date()}`);
      }
    } else {
      if (temp > 60) {
        await setDirection(gpio14, gpio.DIRECTION.OUT);
        await set(gpio14, 0);
        mode = true;
        console.log(`当前温度: ${temp}, 打开风扇 ${new Date()}`);
      }
    }

    await sleep(1000);
  } while (true);
}

function setup(headerNum, direction) {
  return new Promise(resolve => {
    const gpio14 = gpio.export(headerNum, {
      direction: direction,
      ready: function() {
        resolve(gpio14);
      }
   });
  });
}

function set(obj, value) {
  return new Promise(resolve => {
    obj.set(value, () => {
      resolve();
    });
  });
}

function setDirection(obj, value) {
  return new Promise(resolve => {
    obj.setDirection(value, () => {
      resolve();
    });
  });
}

function sleep(millisecond) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, millisecond);
  });
}

main();