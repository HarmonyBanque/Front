import jsPDF from "jspdf";
import "jspdf-autotable";

const generatePDF = (
  account,
  filteredTransactions,
  formatDate,
  translateType
) => {
  const doc = new jsPDF();
  doc.text("Relevé de compte", 14, 16);

  const accountNameText = doc.splitTextToSize(
    `Nom du compte : ${account.name}`,
    180
  );
  const accountNumberText = doc.splitTextToSize(
    `Numéro: ${account.account_number}`,
    180
  );
  const accountBalanceText = doc.splitTextToSize(
    `Solde: ${account.balance} €`,
    180
  );

  doc.text(accountNameText, 14, 22);
  doc.text(accountNumberText, 14, 28);
  doc.text(accountBalanceText, 14, 34);

  const tableColumn = ["Date", "Type", "Montant", "Description"];
  const tableRows = [];

  filteredTransactions.forEach((transaction) => {
    const transactionData = [
      formatDate(transaction.date),
      translateType(transaction.type),
      `${transaction.amount} €`,
      transaction.description || "",
    ];
    tableRows.push(transactionData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
  });
  doc.save(`releve_compte_${account.account_number}.pdf`);
};

export default generatePDF;
