"use client";
import React, { useState, useEffect } from "react";
import { db, database } from "@/config/firebase";
import { ref, set, child, get } from "firebase/database";
import axios from "axios";

const TriggerButton = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("Loading...");

  function writeUserData(userid, status) {
    set(ref(database, "api/" + userid), {
      status: status,
    });
    console.log("User successfully created");
  }
  const getData = async (userId) => {
    const dbRef = ref(database);
    get(child(dbRef, `api/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("Data Now: ", snapshot.val());
          const datas = snapshot.val();
          console.log("Data", datas.status);
          setIsRunning(datas.status);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  async function fetchData() {
    try {
      const response = await axios.post("/api");
      setMessage(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Failed to fetch data");
    }
  }
  useEffect(() => {
    fetchData();
    getData(1);
  }, []);

  const handleButtonClick = async () => {
    isRunning ? writeUserData(1, false) : axios.post(), writeUserData(1, true);
    fetchData();
    getData(1);
  };

  return (
    <div className=" bg-slate-200 flex justify-center items-center w-full h-screen">
      <div className="bg-red-400 p-20 rounded-lg flex flex-col justify-center items-center">
        <h1 className="text-lg mb-10">Server Monitoring</h1>
        <button
          className="p-2 rounded-lg bg-blue-500 mb-4"
          onClick={handleButtonClick}
        >
          {isRunning ? "stop" : "Start Server"}
        </button>
        <div>{isRunning && "Webhook running"}</div>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default TriggerButton;
