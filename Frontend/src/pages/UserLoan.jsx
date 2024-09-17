import "./userLoan.css";
import GaugeChart from "react-gauge-chart";

const UserLoan = () => {
  return (
    <div className="userLoan_card_container">
      <div className="userLoan_card_header">
        <h2>Amount</h2>
        <p>0.00028571 ETH</p>
      </div>
      <div className="userLoan_card_graph">
        <GaugeChart
          id="gauge-chart1"
          nrOfLevels={10}
          colors={["green", "orange", "red"]}
          arcWidth={0.3}
          cornerRadius={3}
          arcPadding={0.01}
          percent={0.37}
          textColor={"white"}
          style={{ width: "350px" }}
          // hideText={true} // If you want to hide the text
        />
      </div>
      <div className="userloan_payloan">
        <button>Pay loan</button>
      </div>
    </div>
  );
};

export default UserLoan;
