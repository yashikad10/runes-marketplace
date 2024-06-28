
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/stores";
import { convertSatoshiToBTC, convertSatoshiToUSD } from "@/utils";

const RuneList = ({ list }: any) => {
  const btcPrice = useSelector((state: RootState) => state.general.btc_price);

  return (
    <div className=" min-h-screen p-8">
      <div className="flex flex-wrap">
        {list?.map((item: any, index: number) => (
          <div
            className="text-white border border-white w-full sm:w-1/2 md:w-1/3 m-4 p-4 rounded-lg shadow-lg hover:border-blue-500"
            key={index}
          >
            <div className="text-xl mb-2 font-bold">{item.runes[0].name}</div>
            {/* {item.runes && item.runes.length > 0 ? item.runes[0].name : "Default Name"} */}
            <div className="text-sm mb-1">
              Listed Price: $
              {convertSatoshiToUSD(item.listed_price, btcPrice).toFixed(2)}
            </div>
            <div className="text-sm mb-1">
              Rune Amount:{" "}
              {convertSatoshiToBTC(item.runes[0].amount) /
                Math.pow(10, item.runes[0].divisibility)}{" "}
              BTC
            </div>
            <div className="flex justify-end">
              <button className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2 mt-4">
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuneList;
