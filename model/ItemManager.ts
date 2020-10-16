
export class ItemManager {

  private static readonly items = {
    0: {id: 0, weight: 1, name: 'Wirt', desc: 'Verteile 3 Rationen', executeType: 0},
    1: {id: 1, weight: 1, name: 'Diplomat', desc: 'Stelle eine Regel auf', executeType: 0},
    2: {id: 2, weight: 1, name: 'Klon', desc: 'Ein anderer Mitspieler muss deine Aufgabe auch machen', executeType: 0},
    3: {id: 3, weight: 1, name: 'Beste Freunde Gulasch', desc: 'Löse eine Trinkbuddy Verbindung auf', executeType: 0},
    4: {id: 4, weight: 1, name: 'Todfeind', desc: '', executeType: 0},
    5: {id: 5, weight: 1, name: 'Joker', desc: 'Führe ein beliebiges Feld aus', executeType: 0},
    6: {id: 6, weight: 1, name: 'MOAB', desc: 'Alle rücken 10 Felder zurück', executeType: 0},
    7: {id: 7, weight: 1, name: 'Assasin', desc: 'Ein Spieler muss einen nach unten', executeType: 0},
    8: {id: 8, weight: 1, name: 'Sabotage', desc: 'Ein Spieler muss 5 Felder zurück', executeType: 0},
    9: {id: 9, weight: 1, name: 'Ah shit, here we go again', desc: 'Spielt danach noch eine Runde Tischspiel', executeType: 0},
    10: {id: 10, weight: 1, name: 'Trittbrettfahrer', desc: 'Exe dein Getränk. Schaffst du es müssen alle anderen dir gleich tun.(Dein Getränk muss mindestens halb voll sein wenn du dieses Item nutzt.)', executeType: 0},
    11: {id: 11, weight: 1, name: 'Losing is Fun', desc: 'Gehe zurück zum Start', executeType: 0},
    12: {id: 12, weight: 1, name: 'Anonymer Tipp', desc: 'ein Spieler muss nächste Runde aussetzen', executeType: 0},
    count: 13,
  };
  private static chanceTable: number[] = undefined;

  constructor() {
  }

  private static generateChanceTable() {
    this.chanceTable = [];
    for (let i = 0; i < this.items.count; i++) {
      for (let j = 0; j < this.items[i].weight; j++) {
        this.chanceTable.push(i);
      }
    }
  }

  static getRandomItem(): number {
    if (this.chanceTable === undefined) {
      this.generateChanceTable()
    }
    const val = Math.floor(Math.random() * Math.floor(this.chanceTable.length));
    return this.chanceTable[val];
  }
  static getName(id: number): string {
    if (id < 0 || id >= this.items.count) {
      return 'undefined';
    } else {
      return this.items[id].name;
    }
  }
  static getDescription(id: number): string {
    if (id < 0 || id >= this.items.count) {
      return 'undefined';
    } else {
      return this.items[id].desc;
    }
  }
}
