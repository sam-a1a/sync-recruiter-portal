/**
 * Haptics.
 *
 * Four effects, mapped onto Android's haptic vocabulary rather than invented:
 * a tick for moving between choices, a press for committing a tap, a confirm
 * for a change that took, and a reject for one that did not. Everything the
 * portal does falls into one of those four, and nothing gets an effect of its
 * own - the same interaction feels the same everywhere, which is the whole
 * point of a vocabulary.
 *
 * WHAT THE WEB CAN AND CANNOT DO
 *
 * `navigator.vibrate` takes durations and gaps. It has no amplitude, so the
 * platform's strength ladder - TICK, CLICK, HEAVY_CLICK, DOUBLE_CLICK - is
 * only half available here. Two of its rungs still are: DOUBLE_CLICK is the
 * strongest of the four purely because it repeats, and repetition is something
 * a duration-only API can express. So strength below is carried by LENGTH and
 * REPETITION, and never by asking for an amplitude that would be ignored.
 *
 * Nothing at all happens on iOS Safari, which does not implement the API. That
 * is a real gap, not a fallback: an iPhone gets the visual half of this and
 * none of the tactile half.
 *
 * THE NUMBERS
 *
 * 10-20ms is the documented band for a keyclick, and the actuator rings on for
 * another 20-50ms past whatever it is given - so a 14ms pulse is felt as a
 * click, and anything past about 30ms stops reading as a click and starts
 * reading as a buzz. Buzzy is the one texture the guidance tells you to avoid
 * for ordinary feedback.
 *
 * Gaps are 50ms because that is the floor at which two pulses are felt as two
 * pulses rather than one smeared one.
 */

type Haptic = 'tick' | 'press' | 'confirm' | 'reject'

const PATTERNS: Record<Haptic, number[]> = {
  /*
   * SEGMENT_TICK: moving between one of a series of choices - a destination in
   * the bar, a tab in the statistics dialog. This one fires more than all the
   * others put together, and the guidance for it is explicit: it has to be
   * "very soft, so as not to be uncomfortable when performed a lot in quick
   * succession". 8ms sits deliberately under the keyclick band. Felt, not
   * announced.
   */
  tick: [8],

  /*
   * CLICK: a tap that commits to something - the theme flipping, a form being
   * sent. Median strength, the middle of the keyclick band.
   */
  press: [14],

  /*
   * CONFIRM: "a short and light vibration" for an interaction that completed.
   * Light first, then a fuller settle - the shape of something landing. The
   * 50ms gap is what keeps it from smearing into one 92ms buzz.
   */
  confirm: [14, 50, 28],

  /*
   * REJECT: "a stronger feedback to signal failure". With no amplitude to
   * reach for, the strength is two equal firm pulses - even, unresolved, the
   * opposite shape to confirm's light-then-settle. Each stays at 30ms so it is
   * still a pair of clicks and not a rasp.
   */
  reject: [30, 50, 30],
}

/**
 * Restraint is the first rule in the guidance: too much vibration numbs people
 * and they turn the whole thing off. So this is called at four kinds of moment
 * and nowhere else - never on scroll, never on hover, never on opening
 * something, and never when a tap changed nothing.
 */
export function haptic(kind: Haptic): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return

  /*
   * The web has no haptics preference, so reduced-motion stands in for one.
   * The two are not the same request - one is about the inner ear, the other
   * about the skin - but somebody who has asked the system to calm down is
   * better served by a quiet device than by a buzzing one, and this is the
   * only switch they have.
   */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  try {
    navigator.vibrate(PATTERNS[kind])
  } catch {
    /* Blocked by the browser, or no actuator. Visual feedback still ran. */
  }
}
