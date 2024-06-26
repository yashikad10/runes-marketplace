
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/stores";
import axios from "axios";
import { useWalletAddress, useSignTx } from "bitcoin-wallet-adapter";

const Runes = ({ rune }: any) => {
  const [expandedRuneDetails, setExpandedRuneDetails] = useState<any>(null);
  const [psbtData, setPsbtData] = useState<any>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [unsignedPsbtBase64, setUnsignedPsbtBase64] = useState<string>("");
  const [action, setAction] = useState<string>("dummy");
  const [loading, setLoading] = useState<boolean>();

  const { loading: signLoading, result, error, signTx: sign } = useSignTx();
  const walletDetails = useWalletAddress();

  const signTx = useCallback(async () => {
    if (!walletDetails) {
      alert("wallet details missing");
      return;
    }
    let inputs = [];
    inputs.push({
      address: walletDetails.cardinal_address,
      publickey: walletDetails.cardinal_pubkey,
      sighash: 1,
      index: [0],
    });

    const options: any = {
      psbt: unsignedPsbtBase64,
      network: "Mainnet",
      action: "sell",
      inputs,
    };
    // console.log(options, "OPTIONS");

    await sign(options);
  }, [action, unsignedPsbtBase64]);

  useEffect(() => {
    // Handling Wallet Sign Results/Errors
    if (result) {
      // Handle successful result from wallet sign
      console.log("Sign Result:", result);
    }
    if (error) {
      console.error("Sign Error:", error);
      setLoading(false);
    }

    setLoading(false);
  }, [result, error]);


  const toggleExpand = async (runeName: string) => {
    try {
      const response = await axios.get(
        `/api/runeDetails?rune_name=${runeName}`
      );
      setExpandedRuneDetails(response.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    toggleExpand(rune);
  }, [rune]);

  const handleInputChange = (
    utxo_id: string,
    ordinal_address: string,
    value: string,
  ) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [`${utxo_id}-${ordinal_address}`]: value,
    }));
  };

  const handleListNowClick = async (
    utxo_id: string,
    receive_address: string,
    amount: number,
    divisibility: number,
    publickey: string,
    wallet: string,
    maker_fee_bp: number
  ) => {
    try {
      const inputValue = inputValues[`${utxo_id}-${receive_address}`];
      const price = (amount * Number(inputValue || 0)) / Math.pow(10, divisibility); // Calculate price based on amount and input value

      const response = await axios.post("/api/v2/order/list-psbt", {
        utxo_id,
        receive_address,
        price,
        divisibility,
        publickey,
        wallet,
        maker_fee_bp,
      });

      setPsbtData(response.data);
      setUnsignedPsbtBase64(response.data.unsigned_psbt_base64);
      console.log(response.data, "psbt data");
    } catch (error: any) {
      console.error("Error fetching PSBT data:", error);
    }
  };

  const BtcPrice = useSelector((state: RootState) => state.general.btc_price);

  const calculateProduct = (amount: number, inputValue: string) => {
    return amount * Number(inputValue || 0);
  };

  const calculateDollarValue = (amount: number) => {
    const productInBTC = amount * BtcPrice; // Convert SATs to BTC
    return productInBTC;
  };

  const convertToSats = (amount: number) => {
    return amount / 100000000; // Convert amount to SATs
  };

  return (
    <div className="">
      {expandedRuneDetails?.map((runeDetail: any, detailIndex: number) => (
        <div
          key={detailIndex}
          className="bg-[#1b4366] p-2 text-white shadow-md rounded-md"
        >
          {runeDetail.runes?.map((item: any, index: number) => (
            <div key={index} className="text-gray-100 flex flex-wrap text-sm">
              <div className="px-4 py-4 whitespace-nowrap sm:w-auto w-3/12">
                <p className="font-semibold text-gray-400">Name:</p>
                <p>{item.name}</p>
              </div>
              <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto">
                <p className="font-semibold text-gray-400">Amount:</p>
                <p>{item.amount}</p>
              </div>
              <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto">
                <p className="font-semibold text-gray-400">Input:</p>
                <input
                  type="text"
                  className="border border-gray-900 bg-transparent rounded outline-none px-3 text-white"
                  onChange={(e) =>
                    handleInputChange(
                      runeDetail.utxo_id,
                      runeDetail.ordinal_address,
                      e.target.value
                    )
                  }
                  placeholder="Enter value"
                />
              </div>
              <div className="px-6 py-4 whitespace-nowrap w-full sm:w-auto">
                <p className="font-semibold text-gray-400">Product (in BTC):</p>
                <p>
                  {calculateProduct(
                    convertToSats(item.amount),
                    inputValues[
                      `${runeDetail.utxo_id}-${runeDetail.ordinal_address}`
                    ]
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
                      inputValues[
                        `${runeDetail.utxo_id}-${runeDetail.ordinal_address}`
                      ]
                    )
                  )}
                </p>
              </div>
              {!unsignedPsbtBase64 ? (
                <div className="flex justify-end w-full">
                  <button
                    onClick={() =>
                      handleListNowClick(
                        runeDetail.utxo_id,
                        runeDetail.ordinal_address,
                        item.amount,
                        item.divisibility,
                        "0335d79181497c88763d437a3f094aa0f7b2e1e2e25e34a7bf8dec7c422761f545",
                        "Leather",
                        10
                      )
                    }
                    className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2 mt-4"
                  >
                    List Now
                  </button>
                </div>
              ) : (
                <div className="flex justify-end w-full">
                  <button
                    onClick={signTx}
                    className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2 mt-4"
                  >
                    Sign Now
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {psbtData && (
        <div className="bg-[#1b4366] p-2 text-white shadow-md rounded-md mt-4">
          <h3 className="text-lg font-semibold">PSBT List</h3>
          <div className="text-sm p-2">
            <p className="p-2">Utxo_id: {psbtData.utxo_id}</p>
            <p className="p-2">Receive Address: {psbtData.receive_address}</p>
            <p className="p-2">
              Public Key:
              {
                "0335d79181497c88763d437a3f094aa0f7b2e1e2e25e34a7bf8dec7c422761f545"
              }
            </p>
            <p className="p-2">Wallet: {"Leather"}</p>
            <p className="p-2">Price: {psbtData.price}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Runes;
