/*
 * Perspective shift utils
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-15 14:39:02
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-28 15:54:18
 */
import { TMatrix4Tuple, IVolume } from "@/types/pointCloud";

class PerspectiveShiftUtils {
  /**
   * Generate a translation matrix
   * @param x
   * @param y
   * @param z
   * @returns
   */
  public static translationMatrix(
    x: number,
    y: number,
    z: number
  ): TMatrix4Tuple {
    return [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
  }

  /**
   * Get the front view's matrix4
   * @param distance
   * @returns
   */
  public static frontViewMatrix4(distance: number): TMatrix4Tuple {
    return this.translationMatrix(distance, 0, 0);
  }

  /**
   * Get the back view's matrix4
   * @param distance
   * @returns
   */
  public static backViewMatrix4(distance: number): TMatrix4Tuple {
    return this.translationMatrix(-distance, 0, 0);
  }

  /**
   * Get the left view's matrix4
   * @param distance
   * @returns
   */
  public static leftViewMatrix4(distance: number): TMatrix4Tuple {
    return this.translationMatrix(0, distance, 0);
  }

  /**
   * Get the right view's matrix4
   * @param distance
   * @returns
   */
  public static rightViewMatrix4(distance: number): TMatrix4Tuple {
    return this.translationMatrix(0, -distance, 0);
  }

  /**
   * Get the top view's matrix4
   * @param distance
   * @returns
   */
  public static topViewMatrix4(distance: number): TMatrix4Tuple {
    return this.translationMatrix(-0.01, 0, distance);
  }

  /**
   * Get the left + front + top view's matrix4
   * @param distance
   * @returns
   */

  public static leftFrontTopViewMatrix4(
    scale: number,
    volume: IVolume
  ): TMatrix4Tuple {
    const offsetX = volume.width / 2;
    const offsetY = volume.height / 2;
    const offsetZ = volume.depth / 2;

    return this.translationMatrix(
      offsetX * scale,
      offsetY * scale,
      offsetZ * scale
    );
  }

  /**
   * Get the right + back + top view's matrix4
   * @param distance
   * @returns
   */
  public static rightBackTopViewMatrix4(
    scale: number,
    volume: IVolume
  ): TMatrix4Tuple {
    const offsetX = -volume.width / 2;
    const offsetY = -volume.height / 2;
    const offsetZ = volume.depth / 2;

    return this.translationMatrix(
      offsetX * scale,
      offsetY * scale,
      offsetZ * scale
    );
  }
}

export default PerspectiveShiftUtils;
