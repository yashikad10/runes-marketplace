import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/stores";
import axios from "axios";
import { useWalletAddress, useSignTx } from "bitcoin-wallet-adapter";
import { getListPsbt } from "@/apiHelper/getListPsbt";

const Runes = ({ rune }: any) => {
  const [expandedRuneDetails, setExpandedRuneDetails] = useState<any>(null);
  const [psbtData, setPsbtData] = useState<any>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [unsignedPsbtBase64, setUnsignedPsbtBase64] = useState<{
    [key: string]: string;
  }>({});
  const [loading, setLoading] = useState<boolean>();
  const [signedPsbtBase64, setSignedPsbtBase64] = useState<string>("");

  const { loading: signLoading, result, error, signTx: sign } = useSignTx();
  const walletDetails = useWalletAddress();

  const signTx = useCallback(
    async (utxoId: string) => {
      if (!walletDetails) {
        alert("wallet details missing");
        return;
      }
      let inputs = [];
      inputs.push({
        address: walletDetails.ordinal_address,
        publickey: walletDetails.ordinal_pubkey,
        sighash: 131,
        index: [0],
      });

      const options: any = {
        psbt: unsignedPsbtBase64[utxoId],
        network: process.env.NEXT_PUBLIC_NETWORK || "Mainnet",
        action: "sell",
        inputs,
      };

      await sign(options);
    },
    [unsignedPsbtBase64, walletDetails, psbtData]
  );

  useEffect(() => {
    if (result) {
      setSignedPsbtBase64(result);
      handleListing(result);
      console.log("Sign Result:", result);
    }
    if (error) {
      console.error("Sign Error:", error);
      setLoading(false);
    }

    setLoading(false);
  }, [result, error]);

  const handleListing = async (signedPsbtBase64: string) => {
    if (!psbtData || !walletDetails) return;

    const orderInput = {
      ...psbtData,
      signed_listing_psbt_base64: signedPsbtBase64,
      maker_fee_bp: psbtData.maker_fee_bp,
      seller_ord_address: psbtData.receive_address,
      seller_receive_address: psbtData.receive_address,
      price: psbtData.price,
      tap_internal_key: walletDetails.ordinal_pubkey,
      unsigned_listing_psbt_base64: psbtData.unsigned_psbt_base64,
    };

    console.log(orderInput, "------orderInput------");

    try {
      const response = await axios.post("/api/v2/order/list-item", orderInput);
      console.log("List Item Response:", response.data);
    } catch (error: any) {
      console.error("Error posting list item:", error);
    }
  };

  const toggleExpand = async (runeName: string) => {
    try {
      const response = await axios.get(
        `/api/rune-details?rune_name=${runeName}`
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
    value: string
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
      const price =
        (amount * Number(inputValue || 0)) / Math.pow(10, divisibility);

      const response = await getListPsbt({
        utxo_id,
        receive_address,
        price,
        divisibility,
        publickey,
        wallet,
        maker_fee_bp,
      });
      console.log(response?.data?.result, "** psbt data **");
      if (response) {
        setPsbtData(response.data?.result);
        setUnsignedPsbtBase64((prev) => ({
          ...prev,
          [utxo_id]: response.data?.result?.unsigned_psbt_base64 || "",
        }));
        console.log(response.data, "psbt data");
      } else {
        console.error("Failed to fetch PSBT data");
      }
    } catch (error: any) {
      console.error("Error fetching PSBT data:", error);
    }
  };

  const BtcPrice = useSelector((state: RootState) => state.general.btc_price);

  const calculateProduct = (amount: number, inputValue: string) => {
    return amount * Number(inputValue || 0);
  };

  const calculateDollarValue = (amount: number) => {
    const productInBTC = amount * BtcPrice;
    return productInBTC;
  };

  const convertToSats = (amount: number) => {
    return amount / 100000000;
  };
  console.log({ psbtData });

  console.log(expandedRuneDetails,"expandedRuneDetails**")
  return (
    <div className="">
      {expandedRuneDetails?.map((runeDetail: any, detailIndex: number) => (
        <div key={detailIndex} className="bg-[#031524] p-2 text-white w-full">
          {runeDetail.runes?.map((item: any, index: number) => (
            <div
              key={index}
              className="text-gray-100 flex flex-wrap items-center text-sm"
            >
              <div className="px-4 py-4 whitespace-nowrap flex-1">
                <p className="font-semibold text-gray-400">Name:</p>
                <p>{item.name}</p>
              </div>
              <div className="px-6 py-4 whitespace-nowrap flex-1">
                <p className="font-semibold text-gray-400">Amount:</p>
                <p>{item.amount / Math.pow(10, item.divisibility)}</p>
              </div>
              <div className="px-6 py-4 whitespace-nowrap flex-1">
                <p className="font-semibold text-gray-400">Input:</p>
                <input
                  type="text"
                  className="border border-gray-900 bg-transparent rounded outline-none px-3 text-white w-full"
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
              <div className="px-6 py-4 whitespace-nowrap flex-1">
                <p className="font-semibold text-gray-400">Product (in BTC):</p>
                <p>
                  {calculateProduct(
                    convertToSats(
                      item.amount / Math.pow(10, item.divisibility)
                    ),
                    inputValues[
                      `${runeDetail.utxo_id}-${runeDetail.ordinal_address}`
                    ]
                  )}{" "}
                  BTC
                </p>
              </div>
              <div className="px-6 py-4 whitespace-nowrap flex-1">
                <p className="font-semibold text-gray-400">Dollar Value:</p>
                <p>
                  $
                  {calculateDollarValue(
                    calculateProduct(
                      convertToSats(
                        item.amount / Math.pow(10, item.divisibility)
                      ),
                      inputValues[
                        `${runeDetail.utxo_id}-${runeDetail.ordinal_address}`
                      ]
                    )
                  ).toFixed(2)}
                </p>
              </div>
              <div className="px-6 py-4 whitespace-nowrap flex-1 flex justify-end">
                {!unsignedPsbtBase64[runeDetail.utxo_id] ||
                psbtData?.utxo_id != runeDetail?.utxo_id ? (
                 <div className="">
                  {/* {console.log({runeDetail})} */}
                  {!runeDetail.listed ? (
                    <button
                    onClick={() =>
                      handleListNowClick(
                        runeDetail.utxo_id,
                        runeDetail.ordinal_address,
                        item.amount,
                        item.divisibility,
                        walletDetails?.ordinal_pubkey || "",
                        walletDetails?.wallet || "",
                        10
                      )
                    }
                    className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2"
                  >
                    List now
                  </button>
                  ) : ( 
                    <button
                 
                    className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2"
                  >
                    Listed
                  </button>
                  )}
                 </div>
                ) : (
                  <button
                    onClick={() => signTx(runeDetail.utxo_id)}
                    className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2"
                  >
                    Sign Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
      {psbtData && (
        <div className="bg-[#031524] p-2 text-white shadow-md  rounded-md mt-4">
          <h3 className="text-lg font-semibold">PSBT List</h3>
          <div className="text-sm p-2 ">
            <p className="p-2">Utxo_id: {psbtData.utxo_id}</p>
            <p className="p-2">Receive Address: {psbtData.receive_address}</p>
            <p className="p-2">
              Public Key:
              {walletDetails?.ordinal_pubkey}
            </p>
            <p className="p-2">Wallet: {walletDetails?.wallet}</p>
            <p className="p-2">Price: {psbtData.price}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Runes;



{/* <button
onClick={() =>
  handleListNowClick(
    runeDetail.utxo_id,
    runeDetail.ordinal_address,
    item.amount,
    item.divisibility,
    walletDetails?.ordinal_pubkey || "",
    walletDetails?.wallet || "",
    10
  )
}
className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2"
>
{expandedRuneDetails.Listed === true ? "List" : "listed"}
</button> */}