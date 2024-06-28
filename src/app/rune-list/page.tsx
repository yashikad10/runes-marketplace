"use client";
import { getRunesList } from "@/apiHelper/getRunesList";
import RuneList from "@/views/RuneList";
import React, { useEffect, useState } from "react";

const RuneListPage = () => {
  const [list, setList] = useState<any[]>();

  const runeList = async () => {
    try {
      const res = await getRunesList();
      const dataArray = res?.data?.data;

      // Check if dataArray is defined and is an array
      if (Array.isArray(dataArray)) {
        setList(dataArray);
      } else {
        console.error("Data is not an array or is undefined");
      }
      // setList(res?.data.data)
      console.log(res, "res-----");
    } catch (error) {}
  };

  useEffect(() => {
    runeList();
  }, []);

  return (
    <div>
      <RuneList list={list} />
    </div>
  );
};

export default RuneListPage;
