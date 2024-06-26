"use client";

import React, { useState, useEffect } from "react";
import Runes from "@/views/Runes";
import { getRunesData } from "@/apiHelper/getRunesData";

type Rune = {
  rune_name: string;
  rune_amount: number;
};

type User = {
  wallet: string;
  cardinal_address: string;
  ordinal_address: string;
  cardinal_pubkey: string;
  runes: Rune[];
};

const RunesData = () => {
  const [runesData, setRunesData] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const ordinalAddress =
    "bc1pa3j3uzypawhrptwpaqk0z7m0z06h3ljyd2srp97gt6dw09emvrwsn826r4"; 

  const fetchData = async () => {
    await getRunesData(ordinalAddress, setRunesData, setErrorMessage);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-8">
      <h4 className="text-2xl font-semibold ml-2 mb-8 text-white" >Collection</h4>
        <ul className="space-y-2 border border-[#28475C] rounded-md ">
          {runesData?.runes.map((rune, index) => (
            <li key={index} className="px-4 py-4 rounded  transition-colors duration-300 text-white border-b border-gray-600 ">
              <div
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => toggleExpand(index)}
              >
                <div>
                  <p className="font-semibold mb-2"> {rune.rune_name}</p>
                  <p className="text-sm text-gray-400">Price: {rune.rune_amount}</p>
                </div>

                {/* <svg
                  className={`w-6 h-6 ${
                    expandedIndex === index ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg> */}
              </div>

              {expandedIndex === index && (
                  <Runes rune={rune.rune_name} />
              )}
            </li>
          ))}
        </ul>
    </div>
  );
};

export default RunesData;
