import React from "react";
import { Line } from "react-chartjs-2";
import { Card } from "flowbite-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Graph = ({ transactions }) => {
  const getData = (types, label, color) => {
    const filteredTransactions = transactions.filter((transaction) =>
      types.includes(transaction.type)
    );
    const dates = filteredTransactions.map((transaction) =>
      new Date(transaction.date).toLocaleDateString("fr-FR")
    );
    const amounts = filteredTransactions.map(
      (transaction) => transaction.amount
    );

    return {
      labels: dates,
      datasets: [
        {
          label: label,
          data: amounts,
          borderColor: color,
          backgroundColor:
            color === "green" ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)",
          fill: true,
        },
      ],
    };
  };

  const getTotalBalanceData = () => {
    let balance = 0;
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const dates = sortedTransactions.map((transaction) =>
      new Date(transaction.date).toLocaleDateString("fr-FR")
    );
    const balances = sortedTransactions.map((transaction) => {
      if (
        transaction.type === "deposit" ||
        transaction.type === "received_transaction"
      ) {
        balance += transaction.amount;
      } else if (transaction.type === "sent_transaction") {
        balance -= transaction.amount;
      }
      return balance;
    });

    return {
      labels: dates,
      datasets: [
        {
          label: "Solde total",
          data: balances,
          borderColor: "blue",
          backgroundColor: "rgba(0, 0, 255, 0.2)",
          fill: true,
        },
      ],
    };
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Graphiques des Transactions</h2>
      <div className="flex justify-center gap-4 space-between">
        <div className="w-full md:w-1/2">
          <Line
            data={getData(
              ["deposit", "received_transaction"],
              "Revenus",
              "green"
            )}
            options={options}
          />
        </div>
        <div className="w-full md:w-1/2">
          <Line
            data={getData(["sent_transaction"], "Dépenses", "red")}
            options={options}
          />
        </div>
      </div>
      <div className="flex w-full items-center mt-4 justify-center ">
        <Line data={getTotalBalanceData()} options={options} />
      </div>
    </Card>
  );
};

export default Graph;
