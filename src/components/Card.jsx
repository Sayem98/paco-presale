import { ConnectKitButton } from "connectkit";
import { PRESALE_ADDRESS, PRESALE_ABI } from "../utils/contract";
import { useEffect } from "react";
import useContract from "../hooks/useContract";
import { useState } from "react";
import { useAccount } from "wagmi";
import { InfinitySpin, RotatingLines } from "react-loader-spinner";
import CustomConnectKitButton from "./CustomConnectKitButton";
function Card() {
  const { address: acount } = useAccount();
  const {
    getData,
    buy_with_token,
    approve_token,
    checkApprove,
    buy_with_native_token,
    getAccountBalance,
    getTokenBalance,
  } = useContract();

  const [change, setChange] = useState(true);
  const [data, setData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [paymentType, setPaymentType] = useState(1);
  const [amount, setAmount] = useState(0);
  const [token, setToken] = useState(0);
  const [balance, setBalance] = useState();
  const [tokenBalance, setTokenBalance] = useState();
  const [days, setDays] = useState();
  const [hours, setHours] = useState();
  const [minutes, setMinutes] = useState();
  const [seconds, setSeconds] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isbuying, setIsbuying] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchContract = async () => {
      const {
        presale_time,
        token,
        usdc,
        usdt,
        rate,
        total_sold,
        total_token_for_sale,
        getETHPrice,
      } = await getData(PRESALE_ABI, PRESALE_ADDRESS);
      setData({
        presale_time,
        token,
        usdc,
        usdt,
        rate,
        total_sold,
        total_token_for_sale,
        getETHPrice,
      });
      setIsLoading(false);
    };
    // get chain id

    console.log(data);
    setIsLoading(false);
     
    fetchContract();
    
  }, [change]);

  useEffect(() => {
    const check = async () => {
      if (paymentType === 1) {
        const allownace = await checkApprove(data.usdt, acount);
        console.log(allownace);
        const isApproved = allownace >= amount;
        setIsApproved(isApproved);
      } else if (paymentType === 2) {
        const allownace = await checkApprove(data.usdc, acount);
        console.log(allownace);
        const isApproved = allownace >= amount;
        setIsApproved(isApproved);
      }
    };

    if (data && acount) {
      check();
    }
  }, [paymentType, acount, amount, change]);

  useEffect(() => {
    const getBalance = async () => {

      if (acount && data) {
        const balance = await getAccountBalance(acount);
        // console.log(balance);
        setBalance(balance);
        const tokenBalance = await getTokenBalance(acount, data.token);
        // console.log(tokenBalance);
        setTokenBalance(tokenBalance);
      }
    };
    getBalance();
  }, [acount, data, change]);

  const buyWithToken = async () => {
    if (!data) {
      alert("Please connect your wallet");
      return;
    }
    setIsbuying(true);
    if (paymentType === 1 || paymentType === 2) {
      if (paymentType === 1) {
        await buy_with_token(PRESALE_ADDRESS, amount, acount, paymentType);
      } else {
        await buy_with_token(PRESALE_ADDRESS, amount, acount, paymentType);
      }
      setIsbuying(false);

      setChange(!change);
    } else {
      alert("Please select payment type");

      setIsbuying(false);
    }
  };

  const handleChange = (e) => {
    if (!data) return;
    setAmount(Number(e.target.value));

    if (paymentType === 1 || paymentType === 2) {
      setToken(Number(e.target.value) * data.rate);
    } else if (paymentType === 3) {
      console.log(data.getETHPrice);
      console.log(data.rate);
      setToken(Number(e.target.value) * data.rate * data.getETHPrice);
    } else {
      setToken(0);
    }
  };

  const approveToken = async () => {
    if (!data) {
      alert("Please connect your wallet");
      return;
    }
    setIsbuying(true);
    if (paymentType === 1) {
      await approve_token(data.usdt, amount, acount);
    } else if (paymentType === 2) {
      await approve_token(data.usdc, amount, acount);
    }
    setIsbuying(false);
    setChange(!change);
  };

  useEffect(() => {
    // Handle times and set time interval
    if (data) {
      const timer = setInterval(async () => {
        const { days, hours, minutes, seconds } = await handleTimer();
        // console.log(time);
        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data]);

  const handleTimer = async () => {
    if(!data.presale_time){
      return;
    }
    const time = parseInt(data.presale_time) - Math.floor(Date.now() / 1000);
    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return { days, hours, minutes, seconds };
  };

  const handleMax = async () => {
    // set amount to max of eth balance if payment type is 3

    if (paymentType === 3) {
      setAmount(Number(balance).toFixed(3));
    } else {
      setAmount(0);
    }
  };
  console.log(data);
  return (
    <div className="bg-black w-[25rem] md:w-[28rem] md:h-[80%] rounded-xl border-[3px] border-black overflow-hidden relative">
      <div className="flex flex-row justify-center mt-2">
        <CustomConnectKitButton />
      </div>

      {isLoading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black opacity-80 z-[100] flex  justify-center items-center">
          <InfinitySpin width="200" color="#ffff" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2 px-6 py-4 text-white">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-white text-gray-900 text-lg font-semibold px-4 md:px-6 py-1 rounded-md">
            {days ? days : 0}d
          </div>
          <div className="bg-white text-gray-900 text-lg font-semibold px-4 md:px-6 py-1 rounded-md">
            {hours ? hours : 0}h
          </div>
          <div className="bg-white text-gray-900 text-lg font-semibold px-4 md:px-6 py-1 rounded-md">
            {minutes ? minutes : 0}m
          </div>
          <div className="bg-white text-gray-900 text-lg font-semibold px-4 md:px-6 py-1 rounded-md">
            {seconds ? seconds : 0}s
          </div>
        </div>

        <h2 className="text-base md:text-lg font-bold tracking-wider py-2">
        $PACO PRESALE IS LIVE
        </h2>

        <div className="bg-white w-full rounded-xl h-6 flex items-center justify-center relative">
          <div
            className={`bg-[#308807] h-full rounded-l-xl absolute top-0 left-0 z-10`}
            style={{
              width: `${
                data
                  ? Math.floor(
                      ((data.total_sold / data.rate).toFixed(2) * 100000) /
                        (data.total_token_for_sale / data.rate).toFixed(2)
                    )
                  : 50
              }%`,
            }}
          ></div>
          <span className="text-gray-800 text-xs font-bold z-50">
             Price : {data ? Number(1 / data.rate).toFixed(7) : 0}$
          </span>
        </div>

        <h4 className="text-sm md:text-base font-bold tracking-wider text-center">
          USDT Raised: {data ? (data.total_sold / data.rate).toFixed(2) : 0} /{" "}
          {data ? (data.total_token_for_sale / data.rate).toFixed(2) : 0}
        </h4>

        <p className="text-sm md:text-base text-gray-500 font-semibold">
          Your Purchased PACO= {tokenBalance ? Number(tokenBalance).toFixed(4) : 0}
        </p>
      </div>

      <div className="bg-[#5e269e] w-full h-full px-6 py-4 flex flex-col items-center gap-4">
        <div className="flex items-center justify-between self-stretch gap-4 px-6">
          <hr className="text-white w-[50%]" />
          <p className="w-full text-white text-xs md:text-sm font-semibold text-center">
            1 PACO= {data ? Number(1 / data.rate).toFixed(7) : 0} USDT
          </p>
          <hr className=" w-[50%]" />
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-2 bg-[#f1f4f6] transition hover:bg-[#cdcfd1] px-6 md:px-8 py-2 ${
              paymentType === 1 && "btn-active"
            } outline-none rounded-md`}
            onClick={() => setPaymentType(1)}
          >
            <img src="/images/usdt.svg" alt="" className="w-5" />
            <span className="text-sm font-semibold">USDT</span>
          </button>
          <button
            className={`flex items-center gap-2 bg-[#f1f4f6] transition hover:bg-[#cdcfd1] px-6 md:px-8 py-2 ${
              paymentType === 2 && "btn-active"
            } outline-none rounded-md`}
            onClick={() => setPaymentType(2)}
          >
            <img src="/images/busd.png" alt="" className="w-5" />
            <span className="text-sm  font-semibold">BUSD</span>
          </button>
          <button
            className={`flex items-center gap-2 bg-[#f1f4f6] transition hover:bg-[#cdcfd1] px-6 md:px-8 py-2 ${
              paymentType === 3 && "btn-active"
            } outline-none rounded-md`}
            onClick={() => setPaymentType(3)}
          >
            <img src="/images/bnb.svg" alt="" className="w-5" />
            <span className="text-sm font-semibold">BNB</span>
          </button>
        </div>

        <h6 className="text-sm text-white font-semibold">
          ETH Balance: {balance ? Number(balance).toFixed(3) : 0}
        </h6>

        <hr className="w-full text-gray-700" />

        <div className="w-full flex flex-col md:flex-row md:items-center gap-2 relative">
          <div className="flex flex-col gap-2">
            <label className="text-xs md:text-sm text-white font-semibold">
              Amount in{" "}
              <span className="font-bold text-xs">
                {paymentType === 3
                  ? "BNB"
                  : paymentType === 2
                  ? "BUSD"
                  : "USDT"}
              </span>{" "}
              you pay
            </label>
            <div className="flex items-center justify-between bg-[#f1f4f6] rounded-md p-3">
              <input
                type="number"
                placeholder="0"
                className="w-full bg-transparent focus:outline-none placeholder:text-gray-600 text-gray-600 font-semibold"
                value={amount}
                onChange={(e) => handleChange(e)}
              />
              <img
                src={`/images/${
                  paymentType === 3
                    ? "bnb"
                    : paymentType === 2
                    ? "busd"
                    : "usdt"
                }.svg`}
                alt=""
                className="w-6"
              />
            </div>
          </div>

          <span
            className="absolute top-[10px] left-full pr-6 md:pr-0 md:left-[45%] transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-black cursor-pointer"
            onClick={handleMax}
          >
            Max
          </span>

          <div className="flex flex-col gap-2">
            <label className="text-xs pl-1 md:text-sm text-white font-semibold">
              Amount in <span className="font-bold">PACO</span> you get
            </label>
            <div className="flex items-center justify-between bg-[#f1f4f6] rounded-md p-3">
              <input
                type="number"
                placeholder="0"
                className="w-full bg-transparent focus:outline-none placeholder:text-gray-600 text-gray-600 font-semibold"
                value={token}
              />
              <img src="/images/logo.png" alt="" className="w-6" />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            className={`bg-black w-full transition duration-400 rounded-3xl text-white text-sm font-semibold p-3 flex justify-center items-center gap-2 ${
              paymentType === 3 && "cursor-not-allowed opacity-50"
            }`}
            onClick={isApproved ? buyWithToken : approveToken}
            disabled={paymentType === 3}
          >
            {isbuying ? (
              <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="20"
                visible={true}
              />
            ) : isApproved ? (
              "Buy Now"
            ) : (
              "Approve"
            )}
          </button>
          <button
            className={`bg-white transition duration-400 hover:bg-black w-full rounded-3xl text-black hover:text-white text-sm font-semibold border-2 border-black p-3 flex justify-center items-center ${
              paymentType !== 3 && "cursor-not-allowed opacity-50"
            }`}
            onClick={async () => (
              setIsbuying(true),
              await buy_with_native_token(PRESALE_ADDRESS, amount, acount),
              setChange(!change),
              setIsbuying(false)
            )}
          >
            {isbuying ? (
              <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="20"
                visible={true}
              />
            ) : (
              "Buy with BNB"
            )}
          </button>
          <button className="bg-[#f1f4f6] transition duration-400 hover:bg-[#cdcfd1] w-full rounded-3xl text-gray-600 text-sm font-semibold border-2 border-[#f1f4f6] hover:border-[#c1c3c5] p-3">
            How to Buy
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
