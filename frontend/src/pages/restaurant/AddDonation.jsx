import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AddDonationForm from '../../components/restaurant/AddDonationForm';

const AddDonation = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/restaurant/donations');
  };

  const handleCancel = () => {
    navigate('/restaurant/donations');
  };

  return (
    <DashboardLayout role="restaurant">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <AddDonationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddDonation;