import { RootState } from "@/stores";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Runes = ({ rune }: any) => {
  const [expandedRuneDetails, setExpandedRuneDetails] = useState<any | null>(
    null
  );
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const toggleExpand = async (runeName: string) => {
    try {
      const response = await axios.get(
        `/api/runeDetails?rune_name=${runeName}`
      );
      setExpandedRuneDetails(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    toggleExpand(rune);
  }, [rune]);

  const handleInputChange = (runeIndex: number, itemIndex: number, value: string) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [`${runeIndex}-${itemIndex}`]: value,
    }));
  };
  
  const BtcPrice = useSelector((state: RootState) => state.general.btc_price);
  const calculateProduct = (
    amount: number,
    runeIndex: number,
    itemIndex: number
  ) => {
    const inputValue = inputValues[`${runeIndex}-${itemIndex}`];
    return inputValue ? amount * Number(inputValue) : 0;
  };

  const calculateDollarValue = (amount: number) => {
    const productInBTC = amount * BtcPrice; // Convert SATs to BTC
    return productInBTC;
  };

  const convertToSats = (amount: number) => {
    return amount / 100000000; // Convert amount to SATs
  };

  const handleEditClick = () => {
    console.log("Edit button clicked");
  };

  return (
    <div className="">
      {expandedRuneDetails?.map((runeDetail: any, detailIndex: any) => (
        <div
          key={detailIndex}
          className="bg-[#1b4366] p-2 text-white shadow-md rounded-md "
        >
            {runeDetail.runes?.map((item: any, index: any) => (
              <div key={index} className="text-gray-100 flex flex-wrap text-sm">
                <div className="px-4 py-4 whitespace-nowrap sm:w-auto w-3/12 ">
                  <p className="font-semibold text-gray-400">Name:</p>
                  <p >{item.name}</p>
                </div>
                <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto ">
                  <p className="font-semibold text-gray-400">Amount:</p>
                  <p>{item.amount}</p>
                </div>
                <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto">
                  <p className="font-semibold text-gray-400">Input:</p>
                  <input
                    type="text"
                    className="border border-gray-900 bg-transparent rounded outline-none px-3 text-white"
                    onChange={(e) =>
                      handleInputChange(detailIndex, index, e.target.value)
                    }
                    placeholder="Enter value"
                  />
                </div>
                <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto">
                  <p className="font-semibold text-gray-400">Product (in BTC):</p>
                  <p>
                    {calculateProduct(
                      convertToSats(item.amount),
                      detailIndex,
                      index
                    )}{" "}
                    BTC
                  </p>
                </div>
                <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto">
                  <p className="font-semibold text-gray-400">Dollar Value:</p>
                  <p>
                    $
                    {calculateDollarValue(
                      calculateProduct(
                        convertToSats(item.amount),
                        detailIndex,
                        index
                      )
                    )}
                  </p>
                </div>
              </div>
            ))}
        </div>
      ))}
      <div className="flex justify-end">
        <button
          onClick={handleEditClick}
          className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2 mt-4"
        >
          List Now
        </button>
      </div>
    </div>
  );
};

export default Runes;
