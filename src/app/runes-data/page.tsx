"use client";

import React, { useState, useEffect } from "react";
import Runes from "@/views/Runes";
import { getRunesData } from "@/apiHelper/getRunesData";
import { useWalletAddress } from "bitcoin-wallet-adapter";

type Rune = {
  rune_name: string;
  rune_amount: number;
  divisibility: number;
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const walletDetails = useWalletAddress();

  console.log(walletDetails?.ordinal_address, "---------------wallet details");

  const fetchData = async () => {
    try {
      if (walletDetails && walletDetails.ordinal_address) {
        const response = await getRunesData(walletDetails.ordinal_address);
        console.log(response, "--------------------response bc1p");
        if (response?.data?.user) {
          setRunesData(response.data.user);
        } else {
          console.error('User data not found in response or response structure is incorrect.');
        }
      } else {
        console.log("error-------------", walletDetails?.ordinal_address);
      }
    } catch (error) {
      console.log("-------------catch error", walletDetails?.ordinal_address);
    }
  };

  useEffect(() => {
    fetchData();
  }, [walletDetails]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="p-8">
      <h4 className="text-2xl font-semibold ml-2 mb-8 text-white">
        Collection
      </h4>
      <ul className="space-y-2 border border-[#28475C] bg-black rounded-md ">
        {runesData?.runes.map((rune, index) => (
          <li
            key={index}
            className="rounded  transition-colors duration-300 text-white border-b border-gray-600 "
          >
            <div
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => toggleExpand(index)}
            >
              <div>
                <p className="font-semibold mb-2 ml-4 mt-2">
                  {" "}
                  {rune.rune_name}
                </p>
                <p className="text-sm text-gray-400 ml-4">
                  Price: {rune.rune_amount / Math.pow(10, rune.divisibility)}
                </p>
              </div>
            </div>

            {expandedIndex === index && <Runes rune={rune.rune_name} />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RunesData;
