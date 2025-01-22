import React from "react";

const AccountCard = ({ account }) => {
  var accountType = "";
  if (account.type === "pea") {
    accountType = "Plan d'épargne en actions";
  } else if (account.type === "livret-a") {
    accountType = "Livret A";
  } else if (account.type === "pel") {
    accountType = "Plan d'Epargne Logement";
  } else if (account.type === "assurance-vie") {
    accountType = "Assurance Vie";
  } else if (account.type === "livret-jeune") {
    accountType = "Livret Jeune";
  } else if (account.type === "compte-courant") {
    accountType = "Compte Courant";
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
        account.isMain ? "bg-blue-100" : "bg-gray-100"
      }`}
    >
      <h3 className="text-lg font-bold mb-2">{account.name}</h3>
      <p className="text-gray-700">{accountType}</p>
      <p className="text-gray-700">{account.account_number}</p>
      <p className="text-gray-700">{account.balance} €</p>
    </div>
  );
};

export default AccountCard;
