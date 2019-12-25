// import store from '@/store'
// const store = window.$nuxt.$store

const { body } = document
const WIDTH = 1024
const RATIO = 3

export default {
  watch: {
    $route(route) {
      if (this.device === 'mobile' && this.sidebar.opened) {
        window.$nuxt.$store.dispatch('closeSideBar', { withoutAnimation: false })
      }
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.resizeHandler)
  },
  mounted() {
    const isMobile = this.isMobile()
    if (isMobile) {
      window.$nuxt.$store.dispatch('toggleDevice', 'mobile')
      window.$nuxt.$store.dispatch('closeSideBar', { withoutAnimation: true })
    }
  },
  methods: {
    isMobile() {
      const rect = body.getBoundingClientRect()
      return rect.width - RATIO < WIDTH
    },
    resizeHandler() {
      if (!document.hidden) {
        const isMobile = this.isMobile()
        window.$nuxt.$store.dispatch('toggleDevice', isMobile ? 'mobile' : 'desktop')

        if (isMobile) {
          window.$nuxt.$store.dispatch('closeSideBar', { withoutAnimation: true })
        }
      }
    }
  }
}
