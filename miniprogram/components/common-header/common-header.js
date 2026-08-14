Component({
  properties: {
    title: { type: String, value: '' },
    step: { type: String, value: '' },
    dark: { type: Boolean, value: false },
    inset: { type: Boolean, value: false }
  },

  methods: {
    handleBack() {
      this.triggerEvent('back')
    }
  }
})
