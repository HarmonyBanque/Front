import Header from "../head_foot/Header";
import Footer from "../head_foot/Footer";
import { Button, Label, TextInput, Checkbox } from "flowbite-react"; // Import Checkbox
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import AddBeneficiaryModal from "./AddBeneficiaryModal";
import toast, { Toaster } from "react-hot-toast";
import { cancelToast } from "./cancelToast";
import axios from "axios";

const Transaction = () => {
  const [amount, setAmount] = useState(0);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiary, setFilteredBeneficiary] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermBeneficiary, setSearchTermBeneficiary] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [isAutomatique, setIsAutomatique] = useState(false); // State for automatic transaction
  const [occurence, setOccurence] = useState(0); // State for occurence

  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8000/accounts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setAccounts(res.data);
          setFilteredAccounts(res.data);
        })
        .catch((error) => {
          console.error("Error fetching accounts:", error);
        });
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedAccount) {
      axios
        .get(
          `http://127.0.0.1:8000/beneficiary/${selectedAccount.account_number}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          // Ajoutez vos comptes personnels à la liste des bénéficiaires
          const personalAccounts = accounts.filter(
            (account) =>
              account.account_number !== selectedAccount.account_number
          );
          const allBeneficiaries = [...res.data, ...personalAccounts];
          setBeneficiaries(allBeneficiaries);
          setFilteredBeneficiary(allBeneficiaries);
        })
        .catch((error) => {
          console.error("Error fetching beneficiaries:", error);
        });
    }
  }, [token, selectedAccount, showModal, accounts]);

  useEffect(() => {
    const results = accounts.filter((account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAccounts(results);
  }, [searchTerm, accounts]);

  useEffect(() => {
    const results = beneficiaries.filter((beneficiary) =>
      beneficiary.name
        .toLowerCase()
        .includes(searchTermBeneficiary.toLowerCase())
    );
    setFilteredBeneficiary(results);
  }, [searchTermBeneficiary, beneficiaries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (token && selectedAccount && selectedBeneficiary) {
      try {
        const transactionResponse = await axios.post(
          "http://127.0.0.1:8000/transactions",
          {
            amount: amount,
            sender_id: selectedAccount.account_number,
            receiver_id:
              selectedBeneficiary.account_number ||
              selectedBeneficiary.beneficiary_account_number,
            description: description,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isAutomatique) {
          await axios.post(
            "http://127.0.0.1:8000/transactions/automatique",
            {
              sender_account: selectedAccount.account_number,
              receiver_account:
                selectedBeneficiary.account_number ||
                selectedBeneficiary.beneficiary_account_number,
              amount: amount,
              occurence: occurence,
              description: description,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        navigate("/");
        cancelToast({
          transactionId: transactionResponse.data.id,
          handleCancel,
        });
      } catch (error) {
        if (error.response) {
          setError(error.response.data.detail);
        }
      }
    }
  };

  const handleCancel = async (e, transactionId) => {
    e.preventDefault();
    if (token && transactionId) {
      console.log("transaction id", transactionId);
      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/transactions/${transactionId}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
      } catch (error) {
        if (error.response) {
          console.log(error.response.data.detail);
        } else {
          console.log("An error occurred", error.message);
        }
      }
    } else {
      console.log("Not authenticated");
    }
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setFilteredBeneficiary(
      accounts.filter((acc) => acc.account_number !== account.account_number)
    );
  };

  const handleBeneficiaryClick = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      <Toaster />
      <Header />
      <div className="h-fit p-10 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Depuis quel compte ?
          </h2>
          <div className="mb-4">
            <TextInput
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              placeholder="Chercher un compte"
            />
          </div>
          <div className="mb-4 overflow-y-auto max-h-40">
            {filteredAccounts.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Nom du compte</th>
                    <th className="py-2 px-4 border-b">IBAN</th>
                    <th className="py-2 px-4 border-b">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr
                      key={account.id}
                      className={`cursor-pointer ${
                        selectedAccount && selectedAccount.id === account.id
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={() => handleAccountClick(account)}
                    >
                      <td className="py-2 px-4 border-b">{account.name}</td>
                      <td className="py-2 px-4 border-b">
                        {account.account_number}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {account.balance} €
                      </td>
                      <td className="py-2 px-4 border-b text-center"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun compte trouvé</p>
            )}
          </div>
          {selectedAccount && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Vers quel bénéficiaire ?
              </h2>
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <TextInput
                    id="search"
                    type="text"
                    value={searchTermBeneficiary}
                    onChange={(e) => setSearchTermBeneficiary(e.target.value)}
                    className="w-full"
                    placeholder="Chercher un bénéficiaire"
                  />
                  <div>
                    <button
                      className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                      onClick={handleShowModal}
                    >
                      Ajouter un bénéficiaire
                    </button>
                    <AddBeneficiaryModal
                      showModal={showModal}
                      handleCloseModal={handleCloseModal}
                      selectedAccount={selectedAccount}
                    />
                  </div>
                </div>
                <div className="mb-4 overflow-y-auto max-h-40">
                  {filteredBeneficiary.length > 0 ? (
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">Nom du compte</th>
                          <th className="py-2 px-4 border-b">IBAN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBeneficiary.map((beneficiary) => (
                          <tr
                            key={beneficiary.id}
                            className={`cursor-pointer ${
                              selectedBeneficiary &&
                              selectedBeneficiary.id === beneficiary.id
                                ? "bg-blue-100"
                                : ""
                            }`}
                            onClick={() => handleBeneficiaryClick(beneficiary)}
                          >
                            <td className="py-2 px-4 border-b">
                              {beneficiary.name ? beneficiary.name : "Inconnu"}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {beneficiary.account_number ||
                                beneficiary.beneficiary_account_number}
                            </td>
                            <td className="py-2 px-4 border-b text-center"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Aucun bénéficiaire trouvé</p>
                  )}
                </div>
              </div>
              {selectedBeneficiary && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    Quel montant ?
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <Label
                        htmlFor="amount"
                        className="block text-gray-700 mb-2"
                      >
                        Montant :
                      </Label>
                      <TextInput
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full"
                        required
                      />
                      <Label
                        htmlFor="description"
                        className="block text-gray-700 mb-2"
                      >
                        Description :
                      </Label>
                      <TextInput
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full"
                        required
                      />
                      <div className="flex items-center mt-4">
                        <Checkbox
                          id="isAutomatique"
                          checked={isAutomatique}
                          onChange={(e) => setIsAutomatique(e.target.checked)}
                        />
                        <Label htmlFor="isAutomatique" className="ml-2">
                          Prélèvement automatique
                        </Label>
                      </div>
                      {isAutomatique && (
                        <div className="mt-4">
                          <Label
                            htmlFor="occurence"
                            className="block text-gray-700 mb-2"
                          >
                            Occurence (en secondes) :
                          </Label>
                          <TextInput
                            id="occurence"
                            type="number"
                            value={occurence}
                            onChange={(e) => setOccurence(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                      )}
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <Button
                      type="submit"
                      color="light"
                      className="w-full hover:bg-gray-200"
                      disabled={!selectedAccount}
                    >
                      Envoyez
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Transaction;
