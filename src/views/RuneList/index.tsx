// import { RootState } from "@/stores";
// import React from "react";
// import { useSelector } from "react-redux";

// const BtcPrice = useSelector((state: RootState) => state.general.btc_price);

// const calculateProduct = (amount: number, inputValue: string) => {
//     return amount * Number(inputValue || 0);
//   };

//   const calculateDollarValue = (amount: number) => {
//     const productInBTC = amount * BtcPrice; // Convert SATs to BTC
//     return productInBTC;
//   };

//   const convertToSats = (amount: number) => {
//     return amount / 100000000; // Convert amount to SATs
//   };

// const RuneList = ({ list }: any) => {
//   console.log(list, "list!!");
//   return (
//     <div className="flex flex-wrap">
//         {list?.map((item: any, index: number) => (
//           <div
//             className="text-white border border-white w-full sm:w-1/2 md:w-1/3 m-4 p-4 rounded-lg shadow-lg"
//             key={index}
//           >
//             <div className="text-lg mb-2">Listed Price: {item.listed_price}</div>
//             <div className="text-md mb-2">Rune Name: {item.runes[0].name}</div>
//             <div className="text-md mb-2">Rune Amount: {item.runes[0].amount}</div>
//             <button className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2 mt-4">Buy Now</button>
//           </div>
//         ))}
//       </div>
//   );
// };

// export default RuneList;

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
