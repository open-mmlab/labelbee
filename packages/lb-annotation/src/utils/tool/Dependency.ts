import { EDependPattern } from '@/constant/tool';

export default class Dependency {
  public static isDependPolygon(dependPattern: EDependPattern) {
    return [EDependPattern.dependPolygon, EDependPattern.dependPrePolygon].includes(dependPattern);
  }

  public static isDependRect(dependPattern: EDependPattern) {
    return [EDependPattern.dependShape, EDependPattern.dependPreShape].includes(dependPattern);
  }
}
