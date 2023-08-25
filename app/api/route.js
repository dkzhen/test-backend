import express from "express";
import axios from "axios";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

const sendMessage = async (title, topic, message) => {
  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      {
        to: `/topics/${topic}`,
        notification: {
          title: title,
          body: message,
        },
        data: {
          // Data yang ingin Anda kirim bersamaan dengan pesan
          customKey: "customValue",
        },
      },
      {
        headers: {
          Authorization: "BEARER " + process.env.API_MSG,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Pesan berhasil dikirim:", response.data);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
};
export async function POST() {
  const app = express();
  const port = 4000; // You can change the port number if needed

  app.use(express.json()); // Add this line to parse JSON request bodies

  // URL API yang ingin Anda pantau
  const apiUrl = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";

  // Variabel untuk menyimpan data terakhir yang diperoleh dari API
  let lastData = null;
  const checkDataChanges = async () => {
    try {
      // Mengirim permintaan GET ke API
      const response = await axios.get(apiUrl);

      // Mendapatkan data dari respons
      const newData = response.data.Infogempa.gempa;

      // Memeriksa perubahan data
      if (JSON.stringify(newData) !== JSON.stringify(lastData)) {
        // Menampilkan data baru dalam konsol jika terjadi perubahan
        console.log("Data baru:", newData);
        const title = `Gempa Bumi di ${newData.Dirasakan}`;
        const message = `#News Gempa dengan kekuatan ${newData.Magnitude} SL , ${newData.Tanggal} ${newData.Jam}, Lokasi : ${newData.Wilayah}`;
        sendMessage(title, "test-api", message);

        // Memperbarui data terakhir dengan data baru
        lastData = newData;
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error.message);
    }
  };

  // Memanggil fungsi checkDataChanges setiap 5 detik
  setInterval(checkDataChanges, 5000);

  // const res = "Discord alert sent successfully";
  setInterval(async () => {
    const TimeConverter = () => {
      const currentTime = new Date();

      // Tentukan perbedaan UTC+7 dalam milisecond
      const utcOffset = 7 * 60 * 60 * 1000;

      // Hitung waktu dalam zona UTC+7
      const currentTimeUtc7 = new Date(currentTime.getTime() + utcOffset);

      // Ekstrak informasi waktu
      const year = currentTimeUtc7.getUTCFullYear();
      const month = currentTimeUtc7.getUTCMonth() + 1; // Ingat bulan dimulai dari 0
      const day = currentTimeUtc7.getUTCDate();
      const hours = currentTimeUtc7.getUTCHours();
      const minutes = currentTimeUtc7.getUTCMinutes();
      const seconds = currentTimeUtc7.getUTCSeconds();

      // Format waktu ke dalam string
      const formattedTime = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} UTC+7`;

      return formattedTime;
    };
    const message = "server running... " + TimeConverter();
    const response = await axios.post(
      "https://discord.com/api/webhooks/1110934381872300103/uONGg3CK-bpRrr_WK4GOX75CsLtqQv7jzfG2N4x5BXYD--w4_UY3UgqJY3AC0vQGyxqP",
      { content: message }
    );
  }, 25000);

  const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Convert escaped newlines to actual newlines
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN,
  };
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://earthquake-41704-default-rtdb.firebaseio.com",
  });

  // Reference to the Firebase database
  const db = admin.database();

  // Function to check if earthquake data already exists in Firebase
  const doesEarthquakeExist = async (earthquake) => {
    const snapshot = await db
      .ref("earthquakes")
      .orderByChild("dateTime")
      .equalTo(earthquake.DateTime)
      .once("value");

    return snapshot.exists();
  };

  // Function to fetch and store earthquake data
  // Function to fetch and store earthquake data
  // Function to fetch and store earthquake data
  const fetchAndStoreEarthquakeData = async () => {
    try {
      const response = await axios.get(
        "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json"
      );
      const data = response.data;

      // Process the earthquake data
      for (const earthquake of data.Infogempa.gempa) {
        const earthquakeExists = await doesEarthquakeExist(earthquake);

        if (!earthquakeExists) {
          const dateTime = earthquake.DateTime;
          const wilayah = earthquake.Wilayah;
          const magnitude = earthquake.Magnitude;
          const kedalaman = earthquake.Kedalaman;
          const jam = earthquake.Jam;
          const tanggal = earthquake.Tanggal;
          const coordinates = earthquake.Coordinates;
          const bujur = earthquake.Bujur;
          const lintang = earthquake.Lintang;
          const potensi = earthquake.Potensi;

          // ... (extract other relevant information)

          // Store the earthquake data in Firebase
          const newEarthquakeRef = db.ref("earthquakes");
          const newEarthquakeKey = newEarthquakeRef.push().key;

          const newEarthquakeData = {
            dateTime,
            wilayah,
            magnitude,
            kedalaman,
            jam,
            tanggal,
            bujur,
            lintang,
            potensi,
            coordinates,
            // ... (store other relevant information)
          };

          const updates = {};
          updates[`earthquakes/${newEarthquakeKey}`] = newEarthquakeData;
          db.ref().update(updates);
        } else {
          console.log("Data already exists, not added to Firebase.");
        }
      }

      console.log("Earthquake data stored in Firebase successfully!");
    } catch (error) {
      console.error(
        "Error fetching or storing earthquake data:",
        error.message
      );
    }
  };

  // Watch the BMKG API at an interval
  const interval = 900000; // Check data every minute
  setInterval(fetchAndStoreEarthquakeData, interval);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  return NextResponse.json(`Server is running on port ${port} `);
}

// import axios from "axios";

// let interval; // Declare the interval outside the handler function
// let isRunning = false;
// export async function GET() {
//   const message = `App running... ${isRunning}`;
//   return NextResponse.json({ message });
// }

// export async function POST() {
//   const message = "Hello, dek!";
//   const res = "Discord alert sent successfully";
//   setInterval(async () => {
//     const response = await axios.post(
//       "https://discord.com/api/webhooks/1110934381872300103/uONGg3CK-bpRrr_WK4GOX75CsLtqQv7jzfG2N4x5BXYD--w4_UY3UgqJY3AC0vQGyxqP",
//       { content: message }
//     );
//   }, 25000);

//   return NextResponse.json(res);
// }
