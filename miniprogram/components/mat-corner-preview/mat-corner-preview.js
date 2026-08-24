Component({
  properties: {
    layers: { type: Array, value: [] },
    activeIndex: { type: Number, value: 0 },
    artStyle: { type: String, value: 'inset:0px' },
    activeRingStyle: { type: String, value: '' },
    pulse: { type: Boolean, value: false }
  },

  methods: {
    handleCycle() {
      this.triggerEvent('matcycle')
    },

    handleLayerTap(event) {
      const index = Number(event.currentTarget.dataset.index)
      if (!Number.isFinite(index)) return
      this.triggerEvent('matlayerselect', { index })
    }
  }
})
