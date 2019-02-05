<template>
<div>{{ display }}</div>
</template>

<script>
export default {
  name: "Certificate",
  data() {
    return {
      time: Date.now()
    }
  },
  computed: {
    display() {
      return Date.now();
    }
  },
  created() {
    setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }
}
</script>
