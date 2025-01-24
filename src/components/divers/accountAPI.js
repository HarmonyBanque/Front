import axios from "axios";

export const fetchAccountDetails = async (accountNumber, token) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/accounts/${accountNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw error;
  }
};

export const fetchTransactions = async (accountNumber, token) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/accounts/${accountNumber}/all_transactions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const fetchAutomatiqueTransactions = async (accountNumber, token) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/transactions/accounts/${accountNumber}/automatique`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching automatique transactions:", error);
    throw error;
  }
};

export const cancelAutomatiqueTransaction = async (transactionId, token) => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/transactions/automatique/${transactionId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling automatique transaction:", error);
    throw error;
  }
};

export const deactivateAccount = async (accountNumber, token) => {
  try {
    await axios.post(
      `http://127.0.0.1:8000/accounts/${accountNumber}/deactivate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Compte désactivé avec succès");
  } catch (error) {
    console.error("Erreur lors de la désactivation du compte :", error);
    throw error;
  }
};
