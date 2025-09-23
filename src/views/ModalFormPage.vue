<template>
  <div class="modal-form-page">
    <!-- <AppNavbar /> -->
    <div class="content-wrapper">
      <AppContainer />
    </div>
    <AppFooter />
  </div>
</template>

<script>
// import AppNavbar from '@/components/AppNavbar.vue';
// import MainContainer from '@/components/MainContainer.vue';
import AppContainer from '@/components/AppContainer.vue';
import AppFooter from '@/components/AppFooter.vue';

export default {
  components: {
    AppFooter,
    AppContainer,
  },
};
</script>

<style scoped>
.modal-form-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

/* Center AppContainer vertically using a wrapper */
.content-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* AppFooter should not shrink and stay at the bottom */
.modal-form-page> :last-child {
  flex-shrink: 0;
  width: 100%;
}
</style>
