restaurantSchema.pre('save', async function() {
  // Only validate on new documents
  if (this.isNew) {
    try {
      const dataToValidate = {
        organizationName: this.organizationName,
        phone: this.phone,
        address: this.address,
        location: this.location,
        operatingHours: this.operatingHours,
        description: this.description,
        certificateUrl: this.certificateUrl,
        totalDonations: this.totalDonations,
        mealsProvided: this.mealsProvided
      };
      
      // Validate with Yup
      await restaurantYupSchema.validate(dataToValidate, { abortEarly: false });
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Transform Yup errors to Mongoose format
        const mongooseError = new Error('Validation failed');
        mongooseError.name = 'ValidationError';
        mongooseError.errors = {};
        
        error.inner.forEach(err => {
          mongooseError.errors[err.path] = {
            message: err.message,
            path: err.path,
            value: err.value
          };
        });
        
        throw mongooseError;
      }
      throw error;
    }
  }
});
