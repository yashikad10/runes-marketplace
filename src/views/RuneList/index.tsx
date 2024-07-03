import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores";
import { convertSatoshiToBTC, convertSatoshiToUSD } from "@/utils";
import axios from "axios";
import { useSignTx, useWalletAddress } from "bitcoin-wallet-adapter";
import { RuneItem } from "@/types";
import { getRunesList } from "@/apiHelper/getRunesList";
import mixpanel from "mixpanel-browser";
import { addNotification } from "@/stores/reducers/notificationReducer";
import { setNewActivity } from "@/stores/reducers/generalReducer";
import { useRouter } from "next/navigation";
import { getCreateBuyPsbt } from "@/apiHelper/getCreateBuyPsbt";

const RuneList = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading: signLoading, result, error, signTx: sign } = useSignTx();
  const [loading, setLoading] = useState<boolean>(false);
  const [inputLength, setInputLength] = useState(0);
  const [list, setList] = useState<RuneItem[]>([]);
  const [buyPsbtData, setBuyPsbtData] = useState<any>();
  const [action, setAction] = useState<string>("");
  const [unsignedPsbtBase64, setUnsignedPsbtBase64] = useState<string>("");

  const btcPrice = useSelector((state: RootState) => state.general.btc_price);
  const walletDetails = useWalletAddress();

  console.log(list, "list*****");

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
  console.log(list?.[0]?.utxo_id, "-list");

  useEffect(() => {
    runeList();
  }, []);

  const handleBuyNowClick = async (
    utxo_id: string,
    pay_address: string,
    receive_address: string,
    publickey: string,
    fee_rate: number,
    wallet: string,
    price: number
  ) => {
    console.log(utxo_id, "------------");
    try {
      // const response = await axios.post("/api/v2/order/create-buy-psbt", {
      //   utxo_id,
      //   pay_address,
      //   receive_address,
      //   publickey,
      //   fee_rate,
      //   wallet,
      //   price,
      // });
      // setBuyPsbtData(response.data);
      // setUnsignedPsbtBase64(response.data.unsigned_psbt_base64);

      // console.log(response.data, "create-buy-psbt data");
      const response = await getCreateBuyPsbt(
        utxo_id,
        pay_address,
        receive_address,
        publickey,
        fee_rate,
        wallet,
        price
      );
      
      if (response?.data) {
        setBuyPsbtData(response.data);
        setUnsignedPsbtBase64(response.data?.result?.unsigned_psbt_base64);
        console.log(response.data, "create-buy-psbt data");
      } else {
        console.error("Error fetching PSBT data:", response?.error);
      }
    } catch (error: any) {
      console.error("Error fetching PSBT data:", error);
    }
  };

  const signTx = useCallback(async () => {
    if (!walletDetails) {
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: "Connect wallet to proceed",
          open: true,
          severity: "warning",
        })
      );
      return;
    }
    let inputs = [];
    
    if (action === "dummy") {
      inputs.push({
        address: walletDetails.cardinal_address,
        publickey: walletDetails.cardinal_pubkey,
        sighash: 131,
        index: [0],
      });
    } else if (action === "buy") {
      new Array(inputLength).fill(1).map((item: number, idx: number) => {
        if (idx !== 2)
          inputs.push({
            address: walletDetails.cardinal_address,
            publickey: walletDetails.cardinal_pubkey,
            sighash: 131,
            index: [idx],
          });
      });
    }
    const options: any = {
      psbt: unsignedPsbtBase64,
      network: process.env.NEXT_PUBLIC_NETWORK || "Mainnet",
      action,
      inputs,
    };
    console.log(options, "OPTIONS");
    await sign(options);
  }, [action, unsignedPsbtBase64]);

  useEffect(() => {
    console.log(unsignedPsbtBase64,"unsigned psbt")
    if (unsignedPsbtBase64) {
      signTx();
    }
  }, [unsignedPsbtBase64]);

  const broadcast = async (signedPsbt: string) => {
    const rune = { ...buyPsbtData };
    console.log(rune,"rune****")
  
    try {
      const { data } = await axios.post("/api/v2/order/broadcast", {
        signed_psbt: signedPsbt,
        activity_tag: action === "dummy" ? "prepare" : "buy",
        user_address: walletDetails?.cardinal_address,
      });
      setLoading(false);
      dispatch(setNewActivity(true));
      // Track successful broadcast
      // mixpanel.track("Broadcast Success", {
      //   action: action, // Assuming 'action' is defined in your component
      //   txid: data.data.txid,
      //   utxo_id: rune.utxo_id,
      //   collection: rune?.official_collection?.name,
      //   pay_address: walletDetails?.cardinal_address,
      //   receive_address: walletDetails?.ordinal_address,
      //   publickey: walletDetails?.cardinal_pubkey,
      //   wallet: walletDetails?.wallet,
      //   fee_rate: 20,
      //   // Additional properties if needed
      // });
      window.open(
        `https://mempool.space/${
          process.env.NEXT_PUBLIC_NETWORK === "testnet" ? "testnet/" : ""
        }tx/${data.data.txid}`,
        "_blank"
      );
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: `Broadcasted ${action} Tx Successfully`,
          open: true,
          severity: "success",
        })
      );
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: `Txid: ${data.data.txid}`,
          open: true,
          severity: "success",
        })
      );
      router.refresh();
    } catch (err: any) {
      // Track error in broadcasting
      // mixpanel.track("Error", {
      //   tag: `Broadcast Error ${action}`,
      //   message:
      //     err.response?.data?.message ||
      //     err.message ||
      //     err ||
      //     "Error broadcasting tx",
      //   ordinal_address: walletDetails?.ordinal_address,
      //   ordinal_pubkey: walletDetails?.ordinal_pubkey,
      //   cardinal_address: walletDetails?.cardinal_address,
      //   cardinal_pubkey: walletDetails?.cardinal_pubkey,
      //   wallet: walletDetails?.ordinal_address,
      //   wallet_name: walletDetails?.wallet,
      //   // Additional properties if needed
      // });
      setLoading(false);
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: err.response.data.message || "Error broadcasting tx",
          open: true,
          severity: "error",
        })
      );
    }
  };

  useEffect(() => {
    // Handling Wallet Sign Results/Errors
    if (result) {
      // Handle successful result from wallet sign
      console.log("Sign Result:", result);
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: "Tx signed successfully",
          open: true,
          severity: "success",
        })
      );
      if (result) {
        broadcast(result);
      }
      // Additional logic here
    }
    if (error) {
      // mixpanel.track("Error", {
      //   tag: `wallet sign error ${action} psbt`,
      //   // utxo_id: data.utxo_id,
      //   message: error || "Wallet signing failed",
      //   ordinal_address: walletDetails?.ordinal_address,
      //   ordinal_pubkey: walletDetails?.ordinal_pubkey,
      //   cardinal_address: walletDetails?.cardinal_address,
      //   cardinal_pubkey: walletDetails?.cardinal_pubkey,
      //   wallet: walletDetails?.ordinal_address,
      //   wallet_name: walletDetails?.wallet,
      //   // Additional properties if needed
      // });
      console.error("Sign Error:", error);
      dispatch(
        addNotification({
          id: new Date().valueOf(),
          message: error.message || "Wallet error occurred",
          open: true,
          severity: "error",
        })
      );
      setLoading(false);
      // Additional logic here
    }
    // Turn off loading after handling results or errors
    setLoading(false);
  }, [result, error]);

  return (
    <div className="min-h-screen p-8">
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
                <button
                  onClick={() =>
                    handleBuyNowClick(
                      item.utxo_id,
                      walletDetails?.cardinal_address || "",
                      walletDetails?.ordinal_address || "",
                      walletDetails?.cardinal_pubkey || "",
                      20,
                      walletDetails?.wallet || "",
                      item.listed_price
                    )
                  }
                  className="bg-gradient-to-r from-[#2C74B3] to-[#205295] text-white font-semibold rounded-md px-4 py-2 mt-4"
                >
                  Buy Now
                </button>
              
            </div>
          </div>
        ))}
      </div>
      {/* {buyPsbtData && (
        <div className=" p-2 text-white shadow-md rounded-md mt-4 bg-[#4199e7]">
          <h3 className="text-lg font-semibold">Buy PSBT </h3>
          <div className="text-sm p-2 ">
            <p className="p-2">Utxo_id: {buyPsbtData.utxo_id}</p>
            <p className="p-2">
              Receive Address: {buyPsbtData.receive_address}
            </p>
            <p className="p-2">
              Public Key: {walletDetails?.cardinal_pubkey || ""}
            </p>
            <p className="p-2">Wallet: {walletDetails?.wallet || ""}</p>
            <p className="p-2">
              Unsigned psbt: {buyPsbtData.unsigned_psbt_base64}
            </p>
          </div>
          
        </div>
      )} */}
    </div>
  );
};

export default RuneList;
