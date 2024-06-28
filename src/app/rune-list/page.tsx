"use client";
import { getRunesList } from "@/apiHelper/getRunesList";
import RuneList from "@/views/RuneList";
import React, { useEffect, useState } from "react";

const RuneListPage = () => {
  const [list, setList] = useState<any[]>();

  const runeList = async () => {
    try {
      const res = await getRunesList();
      setList(res?.data.data)
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
