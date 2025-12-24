import { donationAPI } from './api';

export const getAllDonations = (params) => donationAPI.getAll(params);
export const getDonation = (id) => donationAPI.getById(id);
export const createDonation = (data) => donationAPI.create(data);
export const updateDonation = (id, data) => donationAPI.update(id, data);
export const deleteDonation = (id) => donationAPI.delete(id);
export const acceptDonation = (id) => donationAPI.accept(id);
export const markAsPickedUp = (id) => donationAPI.markAsPickedUp(id);
export const getNearbyDonations = (params) => donationAPI.getNearby(params);
export const getMyDonations = () => donationAPI.getMyDonations();
export const getDonationStats = () => donationAPI.getStats();