/* ==========================================
   UTILITY HUB
   ========================================== */


/* CLOCK */

function updateClock() {

  const now = new Date();

  document.getElementById("liveClock").textContent =
    now.toLocaleTimeString("id-ID", {
      hour12: false
    });

  document.getElementById("liveDate").textContent =
    now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

}

setInterval(updateClock, 1000);
updateClock();


/* THEME */

document
  .getElementById("themeBtn")
  .addEventListener("click", () => {

    document.body.classList.toggle("light");

    document.getElementById("themeBtn").textContent =
      document.body.classList.contains("light")
        ? "🌙"
        : "☀️";

  });


/* TAB */

document.querySelectorAll(".tab")
.forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".tab")
      .forEach(btn =>
        btn.classList.remove("active")
      );

    document
      .querySelectorAll(".panel")
      .forEach(panel =>
        panel.classList.remove("active")
      );

    button.classList.add("active");

    document
      .getElementById(button.dataset.target)
      .classList.add("active");

  });

});


/* ==========================================
   CALCULATOR
   ========================================== */

let expression = "";

const display =
  document.getElementById("calcDisplay");


function updateDisplay() {

  display.value =
    expression || "0";

}


document
  .querySelectorAll(".calc")
  .forEach(button => {

    button.addEventListener("click", () => {

      const value =
        button.dataset.value;

      const action =
        button.dataset.action;


      if (action === "clear") {

        expression = "";

        updateDisplay();

        return;

      }


      if (action === "back") {

        expression =
          expression.slice(0, -1);

        updateDisplay();

        return;

      }


      if (action === "equal") {

        try {

          if (!expression)
            return;

          const safe =
            expression.replace(
              /%/g,
              "/100"
            );

          if (
            !/^[0-9+\-*/().\s]+$/
              .test(safe)
          ) {

            throw new Error();

          }

          const result =
            Function(
              `"use strict"; return (${safe})`
            )();

          if (!Number.isFinite(result))
            throw new Error();

          expression =
            String(
              Math.round(
                result * 1000000000000
              ) / 1000000000000
            );

          updateDisplay();

        }

        catch {

          display.value = "Error";

          expression = "";

        }

        return;

      }


      if (value) {

        const last =
          expression.slice(-1);

        if (
          "+-*/".includes(value) &&
          "+-*/".includes(last)
        ) {

          expression =
            expression.slice(0,-1) +
            value;

        }

        else {

          expression += value;

        }

        updateDisplay();

      }

    });

  });


/* KEYBOARD CALCULATOR */

document.addEventListener(
  "keydown",
  event => {

    if (
      /^[0-9.+\-*/%]$/
        .test(event.key)
    ) {

      expression += event.key;

      updateDisplay();

    }

    else if (
      event.key === "Enter"
    ) {

      document
        .querySelector(
          '[data-action="equal"]'
        )
        .click();

    }

    else if (
      event.key === "Backspace"
    ) {

      document
        .querySelector(
          '[data-action="back"]'
        )
        .click();

    }

    else if (
      event.key === "Escape"
    ) {

      document
        .querySelector(
          '[data-action="clear"]'
        )
        .click();

    }

  }
);


/* ==========================================
   STOPWATCH
   ========================================== */

let stopwatchRunning = false;

let stopwatchStart = 0;

let stopwatchElapsed = 0;

let stopwatchInterval = null;

let lapTimes = [];


function formatStopwatch(ms) {

  const hours =
    Math.floor(ms / 3600000);

  const minutes =
    Math.floor(
      (ms % 3600000) / 60000
    );

  const seconds =
    Math.floor(
      (ms % 60000) / 1000
    );

  const centiseconds =
    Math.floor(
      (ms % 1000) / 10
    );


  return (
    String(hours).padStart(2,"0") +
    ":" +
    String(minutes).padStart(2,"0") +
    ":" +
    String(seconds).padStart(2,"0") +
    "." +
    String(centiseconds).padStart(2,"0")
  );

}


function renderStopwatch() {

  let elapsed =
    stopwatchElapsed;

  if (stopwatchRunning) {

    elapsed +=
      performance.now() -
      stopwatchStart;

  }

  document
    .getElementById("stopwatchDisplay")
    .textContent =
      formatStopwatch(elapsed);

}


function renderLaps() {

  document.getElementById("laps")
    .innerHTML =
      lapTimes
        .map(
          (time,index) => `
            <div class="lap">
              <span>Lap ${index + 1}</span>
              <strong>
                ${formatStopwatch(time)}
              </strong>
            </div>
          `
        )
        .reverse()
        .join("");

}


document
  .getElementById("startStopwatch")
  .addEventListener("click", () => {

    if (!stopwatchRunning) {

      stopwatchStart =
        performance.now();

      stopwatchRunning = true;

      stopwatchInterval =
        setInterval(
          renderStopwatch,
          25
        );

      document
        .getElementById("startStopwatch")
        .textContent =
          "Jeda";

    }

    else {

      stopwatchElapsed +=
        performance.now() -
        stopwatchStart;

      stopwatchRunning = false;

      clearInterval(
        stopwatchInterval
      );

      document
        .getElementById("startStopwatch")
        .textContent =
          "Lanjutkan";

    }

    renderStopwatch();

  });


document
  .getElementById("lapStopwatch")
  .addEventListener("click", () => {

    if (!stopwatchRunning)
      return;

    lapTimes.push(
      stopwatchElapsed +
      performance.now() -
      stopwatchStart
    );

    renderLaps();

  });


document
  .getElementById("resetStopwatch")
  .addEventListener("click", () => {

    clearInterval(
      stopwatchInterval
    );

    stopwatchRunning = false;

    stopwatchStart = 0;

    stopwatchElapsed = 0;

    lapTimes = [];

    document
      .getElementById("startStopwatch")
      .textContent =
        "Mulai";

    renderStopwatch();

    renderLaps();

  });


renderStopwatch();


/* ==========================================
   QR SCANNER
   ========================================== */

let qrScanner = null;


document
  .getElementById("startQR")
  .addEventListener("click", async () => {

    const result =
      document.getElementById(
        "qrResult"
      );

    if (
      typeof Html5Qrcode ===
      "undefined"
    ) {

      result.textContent =
        "QR Scanner belum tersedia. Pastikan koneksi internet aktif.";

      return;

    }


    if (qrScanner)
      return;


    qrScanner =
      new Html5Qrcode(
        "qr-reader"
      );


    try {

      await qrScanner.start(

        {
          facingMode: "environment"
        },

        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 250
          }

        },

        decodedText => {

          result.textContent =
            decodedText;

        },

        () => {}

      );

    }

    catch (error) {

      result.textContent =
        "Kamera tidak dapat digunakan: " +
        error.message;

      qrScanner = null;

    }

  });


document
  .getElementById("stopQR")
  .addEventListener("click", async () => {

    if (!qrScanner)
      return;

    try {

      await qrScanner.stop();

      qrScanner.clear();

    }

    catch {}

    qrScanner = null;

  });


document
  .getElementById("copyQR")
  .addEventListener("click", () => {

    const result =
      document.getElementById(
        "qrResult"
      ).textContent;

    if (
      !result ||
      result === "Belum ada hasil."
    )
      return;

    navigator.clipboard
      .writeText(result);

  });


/* ==========================================
   GPS
   ========================================== */

let currentLatitude = null;

let currentLongitude = null;


function getGPS() {

  const status =
    document.getElementById(
      "gpsStatus"
    );


  if (!navigator.geolocation) {

    status.textContent =
      "Browser tidak mendukung GPS.";

    return;

  }


  status.textContent =
    "Meminta izin lokasi...";


  navigator.geolocation
    .getCurrentPosition(

      position => {

        currentLatitude =
          position.coords.latitude;

        currentLongitude =
          position.coords.longitude;


        document
          .getElementById("latitude")
          .textContent =
            currentLatitude.toFixed(6);


        document
          .getElementById("longitude")
          .textContent =
            currentLongitude.toFixed(6);


        document
          .getElementById("accuracy")
          .textContent =
            Math.round(
              position.coords.accuracy
            ) + " meter";


        document
          .getElementById("altitude")
          .textContent =
            position.coords.altitude === null
              ? "Tidak tersedia"
              : Math.round(
                  position.coords.altitude
                ) + " meter";


        status.textContent =
          "Lokasi berhasil diperoleh pada " +
          new Date()
            .toLocaleTimeString("id-ID");


        document
          .getElementById("openMaps")
          .disabled = false;


        calculateQibla();

      },

      error => {

        status.textContent =
          "GPS gagal: " +
          error.message;

      },

      {

        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0

      }

    );

}


document
  .getElementById("getGPS")
  .addEventListener(
    "click",
    getGPS
  );


document
  .getElementById("openMaps")
  .addEventListener(
    "click",
    () => {

      if (
        currentLatitude === null
      )
        return;


      const url =
        "https://www.google.com/maps?q=" +
        currentLatitude +
        "," +
        currentLongitude;


      window.open(
        url,
        "_blank"
      );

    }
  );


/* ==========================================
   QIBLA
   ========================================== */

const KAABA_LAT =
  21.422487;

const KAABA_LON =
  39.826206;


function calculateBearing(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const rad =
    Math.PI / 180;

  const phi1 =
    lat1 * rad;

  const phi2 =
    lat2 * rad;

  const deltaLon =
    (lon2 - lon1) * rad;


  const y =
    Math.sin(deltaLon) *
    Math.cos(phi2);


  const x =
    Math.cos(phi1) *
    Math.sin(phi2) -
    Math.sin(phi1) *
    Math.cos(phi2) *
    Math.cos(deltaLon);


  return (
    (
      Math.atan2(y,x) /
      rad
    ) +
    360
  ) % 360;

}


function calculateQibla() {

  if (
    currentLatitude === null
  )
    return;


  const bearing =
    calculateBearing(
      currentLatitude,
      currentLongitude,
      KAABA_LAT,
      KAABA_LON
    );


  document
    .getElementById("qiblaDegree")
    .textContent =
      bearing.toFixed(1) +
      "°";


  document
    .getElementById("qiblaText")
    .textContent =
      "Arah kiblat dari lokasi Anda sekitar " +
      bearing.toFixed(1) +
      "° dari utara sejati.";


  document
    .getElementById("qiblaNeedle")
    .style.transform =
      `translate(-50%,-70%) rotate(${bearing}deg)`;

}


document
  .getElementById("qiblaGPS")
  .addEventListener(
    "click",
    getGPS
  );


/* ==========================================
   WEATHER
   ========================================== */

const weatherCodes = {

  0: ["☀️","Cerah"],

  1: ["🌤️","Cerah berawan"],

  2: ["⛅","Berawan sebagian"],

  3: ["☁️","Mendung"],

  45: ["🌫️","Kabut"],

  48: ["🌫️","Kabut"],

  51: ["🌦️","Gerimis"],

  53: ["🌦️","Gerimis"],

  55: ["🌧️","Gerimis lebat"],

  61: ["🌧️","Hujan ringan"],

  63: ["🌧️","Hujan"],

  65: ["🌧️","Hujan lebat"],

  71: ["🌨️","Salju ringan"],

  73: ["🌨️","Salju"],

  75: ["❄️","Salju lebat"],

  80: ["🌦️","Hujan singkat"],

  81: ["🌦️","Hujan singkat"],

  82: ["⛈️","Hujan deras"],

  95: ["⛈️","Badai petir"],

  96: ["⛈️","Badai + hujan es"],

  99: ["⛈️","Badai + hujan es"]

};


async function loadWeather() {

  if (
    currentLatitude === null
  ) {

    getGPS();

    setTimeout(
      loadWeather,
      1500
    );

    return;

  }


  const description =
    document.getElementById(
      "weatherDescription"
    );


  description.textContent =
    "Memuat cuaca...";


  try {

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${currentLatitude}` +
      `&longitude=${currentLongitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto` +
      `&forecast_days=5`;


    const response =
      await fetch(url);


    if (!response.ok)
      throw new Error(
        "Server cuaca tidak merespons."
      );


    const data =
      await response.json();


    const current =
      data.current;


    const info =
      weatherCodes[
        current.weather_code
      ] ||
      ["🌡️","Tidak diketahui"];


    document
      .getElementById("weatherIcon")
      .textContent =
        info[0];


    document
      .getElementById("temperature")
      .textContent =
        Math.round(
          current.temperature_2m
        ) + "°C";


    description.textContent =
      info[1];


    document
      .getElementById("humidity")
      .textContent =
        current.relative_humidity_2m +
        "%";


    document
      .getElementById("wind")
      .textContent =
        Math.round(
          current.wind_speed_10m
        ) +
        " km/j";


    document
      .getElementById("weatherLocation")
      .textContent =
        currentLatitude.toFixed(3) +
        ", " +
        currentLongitude.toFixed(3);


    document
      .getElementById("weatherUpdate")
      .textContent =
        new Date(
          current.time
        ).toLocaleTimeString(
          "id-ID"
        );


    const forecast =
      document.getElementById(
        "forecast"
      );


    forecast.innerHTML =
      data.daily.time
        .map(
          (date,index) => {

            const weather =
              weatherCodes[
                data.daily
                  .weather_code[index]
              ] ||
              ["🌡️","—"];


            const day =
              new Date(
                date +
                "T12:00:00"
              ).toLocaleDateString(
                "id-ID",
                {
                  weekday: "short"
                }
              );


            return `
              <div class="forecast-day">

                <span>${day}</span>

                <b>${weather[0]}</b>

                <small>
                  ${weather[1]}
                </small>

                <strong>
                  ${Math.round(
                    data.daily
                      .temperature_2m_max[index]
                  )}°
                  /
                  ${Math.round(
                    data.daily
                      .temperature_2m_min[index]
                  )}°
                </strong>

              </div>
            `;

          }
        )
        .join("");

  }

  catch(error) {

    description.textContent =
      "Cuaca gagal dimuat: " +
      error.message;

  }

}


document
  .getElementById("weatherBtn")
  .addEventListener(
    "click",
    loadWeather
  );


/* ==========================================
   RANDOM NUMBER
   ========================================== */

document
  .getElementById("randomBtn")
  .addEventListener(
    "click",
    () => {

      let min =
        Number(
          document
            .getElementById("minNumber")
            .value
        );


      let max =
        Number(
          document
            .getElementById("maxNumber")
            .value
        );


      if (min > max) {

        [
          min,
          max
        ] =
        [
          max,
          min
        ];

      }


      const result =
        Math.floor(
          Math.random() *
          (
            max -
            min +
            1
          )
        ) +
        min;


      document
        .getElementById(
          "randomResult"
        )
        .textContent =
          result;

    }
  );


/* ==========================================
   TEXT COUNTER
   ========================================== */

document
  .getElementById("textInput")
  .addEventListener(
    "input",
    event => {

      const text =
        event.target.value;


      document
        .getElementById(
          "characters"
        )
        .textContent =
          text.length;


      document
        .getElementById(
          "words"
        )
        .textContent =
          text.trim()
            ? text.trim()
              .split(/\s+/)
              .length
            : 0;

    }
  );


/* ==========================================
   PASSWORD
   ========================================== */

function generatePassword() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789!@#$%&*";


  let password = "";


  const values =
    new Uint32Array(18);


  crypto
    .getRandomValues(values);


  values.forEach(
    value => {

      password +=
        chars[
          value %
          chars.length
        ];

    }
  );


  return password;

}


document
  .getElementById("passwordBtn")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "passwordResult"
        )
        .textContent =
          generatePassword();

    }
  );


/* ==========================================
   COUNTDOWN
   ========================================== */

let countdown = 60;

let countdownTimer = null;


function renderCountdown() {

  const minutes =
    Math.floor(
      countdown / 60
    );


  const seconds =
    countdown % 60;


  document
    .getElementById(
      "countDisplay"
    )
    .textContent =

      String(minutes)
        .padStart(2,"0") +

      ":" +

      String(seconds)
        .padStart(2,"0");

}


document
  .getElementById("countStart")
  .addEventListener(
    "click",
    () => {

      if (countdownTimer)
        return;


      const minutes =
        Number(
          document
            .getElementById(
              "countMinutes"
            )
            .value
        ) || 0;


      const seconds =
        Number(
          document
            .getElementById(
              "countSeconds"
            )
            .value
        ) || 0;


      countdown =
        Math.max(
          0,
          minutes * 60 +
          seconds
        );


      renderCountdown();


      countdownTimer =
        setInterval(
          () => {

            countdown--;

            renderCountdown();


            if (
              countdown <= 0
            ) {

              clearInterval(
                countdownTimer
              );

              countdownTimer =
                null;

              alert(
                "⏰ Countdown selesai!"
              );

            }

          },
          1000
        );

    }
  );


document
  .getElementById("countReset")
  .addEventListener(
    "click",
    () => {

      clearInterval(
        countdownTimer
      );

      countdownTimer = null;

      countdown = 60;

      renderCountdown();

    }
  );


renderCountdown();