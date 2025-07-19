import java.util.*;
public class tower {
    public static int tof(int n, String src, String helper, String des) {
        if (n == 1) {
            System.out.println("Transfer disk from " + src + " to " + des);
            return 1;
        }
        int moves = 0;
        moves += tof(n - 1, src, des, helper);
        System.out.println("Transfer disk from " + src + " to " + des);
        moves += 1;
        moves += tof(n - 1, helper, src, des);
        return moves;
        
    }



    public static void main(String[] args) {
        int n = 3; // You can change this to 5 or any other number of disks
        int totalMoves = tof(n, "Source", "Helper", "Destination");
        System.out.println("Total moves: " + totalMoves);
    }
}
