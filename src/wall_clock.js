// Relógio de parede construído a partir de um modelo importado; os ponteiros seguem a hora local do computador.

// Wall clock built from an imported model; its hands follow the computer's local time.
import * as THREE from 'three'

export default class WallClock extends THREE.Group {
  // object: o modelo importado; hands: nome do nó e ângulo de repouso (graus) de cada ponteiro, vindos do JSON do layout.

  // object: the imported model; hands: node name and rest angle (degrees) of each hand, from the layout JSON.
  constructor(object, hands) {
    super()
    this.add(object)

    // Os ponteiros do modelo não estão nas 12 horas, por isso cada um guarda o ângulo com que foi modelado.

    // The model's hands are not at 12 o'clock, so each one keeps the angle it was modelled at.
    this.handH = object.getObjectByName(hands.hours.node)
    this.handM = object.getObjectByName(hands.minutes.node)
    this.handS = object.getObjectByName(hands.seconds.node)
    this.restH = THREE.MathUtils.degToRad(hands.hours.restAngle)
    this.restM = THREE.MathUtils.degToRad(hands.minutes.restAngle)
    this.restS = THREE.MathUtils.degToRad(hands.seconds.restAngle)
  }

  // Define o ângulo de um ponteiro; um ponteiro que não exista no modelo é ignorado.

  // Sets one hand's angle; a hand missing from the model is skipped.
  setHand(hand, angle) {
    if (hand) hand.rotation.z = angle
  }

  // Chamado uma vez por frame; o ponteiro dos segundos avança aos saltos, como num relógio de quartzo.

  // Called once per frame; the second hand ticks like a quartz clock.
  update() {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    this.setHand(this.handH, this.restH - 2.0 * Math.PI * (hours / 12.0 + minutes / (12.0 * 60.0) + seconds / (12.0 * 60.0 * 60.0)))
    this.setHand(this.handM, this.restM - 2.0 * Math.PI * (minutes / 60.0 + seconds / (60.0 * 60.0)))
    this.setHand(this.handS, this.restS - 2.0 * Math.PI * seconds / 60.0)
  }
}
