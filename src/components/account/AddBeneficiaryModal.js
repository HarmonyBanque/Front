import React from "react";
import { useState, useContext, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "../../AuthContext";

const AddBeneficiaryModal = ({
  showModal,
  handleCloseModal,
  selectedAccount,
}) => {
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryAccountNumber, setBeneficiaryAccountNumber] = useState("");
  const { token } = useContext(AuthContext);
  const [beneficiaryError, setBeneficiaryError] = useState("");

  const handleSubmitBeneficiary = async (
    beneficiaryName,
    beneficiaryAccountNumber,
    selectedAccount
  ) => {
    if (token && selectedAccount) {
      try {
        await axios.post(
          "http://127.0.0.1:8000/beneficiary",
          {
            account_number: selectedAccount.account_number,
            beneficiary_account_number: beneficiaryAccountNumber,
            name: beneficiaryName,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        handleCloseModal();
        setBeneficiaryAccountNumber("");
        setBeneficiaryName("");
        setBeneficiaryError("");
      } catch (error) {
        if (error.response) {
          console.log(error);
          setBeneficiaryError(error.response.data.detail);
          setBeneficiaryAccountNumber("");
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitBeneficiary(
      beneficiaryName,
      beneficiaryAccountNumber,
      selectedAccount
    );
  };

  return (
    <Modal
      isOpen={showModal}
      onRequestClose={handleCloseModal}
      contentLabel="Ajout d'un bénéficiaire"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Ajout d'un bénéficiaire</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="beneficiaryName"
            >
              Nom
            </label>
            <input
              type="text"
              id="beneficiaryName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="beneficiaryAccountNumber"
            >
              IBAN
            </label>
            <input
              type="text"
              id="beneficiaryAccountNumber"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={beneficiaryAccountNumber}
              onChange={(e) => setBeneficiaryAccountNumber(e.target.value)}
            />
          </div>
          {beneficiaryError && (
            <p className="text-red-500 mb-4">{beneficiaryError}</p>
          )}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors duration-300"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmitBeneficiary}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors duration-300"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddBeneficiaryModal;
