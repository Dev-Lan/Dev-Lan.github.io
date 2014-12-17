clear;
close all;

addpath /Users/johnoleary/Documents/Work/MARS/MarsFramework/MATLAB/robotics3D

num_map = 4;
for i = 1:num_map
    file_name = sprintf('/Users/johnoleary/Documents/School/CurrentClasses/Visualization/FinalProject/Vis-Project/threejs/utility_functions/New_Result/SIFT_30m/xkk_big_map_%d.txt', i-1);
    xkk{i} = dlmread(file_name);
end

for i = 1:num_map - 1
    file_name = sprintf('/Users/johnoleary/Documents/School/CurrentClasses/Visualization/FinalProject/Vis-Project/threejs/utility_functions/New_Result/SIFT_30m/Gi_q_G1_%d.txt', i-1);
    Gi_q_G1{i} = dlmread(file_name);
    file_name = sprintf('/Users/johnoleary/Documents/School/CurrentClasses/Visualization/FinalProject/Vis-Project/threejs/utility_functions/New_Result/SIFT_30m/Gi_p_G1_%d.txt', i-1);
    Gi_p_G1{i} = dlmread(file_name);    
end
for j = 2:num_map
    for i = 1:size(xkk{j})/16
        xkk{j}(16*(i-1) + [14:16]) = quat2rot(Gi_q_G1{j-1})' * (xkk{j}(16*(i-1) + [14:16]) - Gi_p_G1{j-1});
        xkk{j}(16*(i-1) + [1:4]) = rot2quat( ( quat2rot(Gi_q_G1{j-1})' * quat2rot(xkk{j}(16*(i-1) + [1:4]))' ) );
    end
end

%% 
for j = 1:1
    for i = 1:size(xkk{j})/16
        xkk{j}(16*(i-1)+[1:4]) = quat_inv(xkk{j}(16*(i-1)+[1:4]));
    end
end
I_p_C = [0.0443505; 0.0265335; -0.00447918];
I_q_C = [-0.0107418; -0.0190641; -0.708405; 0.705467];
for j = 1:num_map
    for i = 1:size(xkk{j})/16
        xkk{j}(16*(i-1)+[14:16]) = xkk{j}(16*(i-1)+[14:16]) + quat2rot(xkk{j}(16*(i-1)+[1:4])) * I_p_C;
        xkk{j}(16*(i-1)+[1:4]) = quat_mul(xkk{j}(16*(i-1)+[1:4]), I_q_C);
    end
end



figure;
plot3(xkk{1}(14:16:end),xkk{1}(15:16:end),xkk{1}(16:16:end),'-b');hold on;
plot3(xkk{2}(14:16:end),xkk{2}(15:16:end),xkk{2}(16:16:end),'-r');hold on;
plot3(xkk{3}(14:16:end),xkk{3}(15:16:end),xkk{3}(16:16:end),'-g');hold on;
plot3(xkk{4}(14:16:end),xkk{4}(15:16:end),xkk{4}(16:16:end),'-k');hold on;

grid; axis equal;
xlabel('x (m)');
ylabel('y (m)');
zlabel('z (m)');
title('Trajectory');

figure;

plot3(xkk{1}(14:16:end),xkk{1}(15:16:end),xkk{1}(16:16:end),'-b');hold on;
plot3(xkk{2}(14:16:end),xkk{2}(15:16:end),xkk{2}(16:16:end),'-r');hold on;
plot3(xkk{3}(14:16:end),xkk{3}(15:16:end),xkk{3}(16:16:end),'-g');hold on;

grid; axis equal;
xlabel('x (m)');
ylabel('y (m)');
zlabel('z (m)');
title('Trajectory');

figure;

plot3(xkk{1}(14:16:end),xkk{1}(15:16:end),xkk{1}(16:16:end),'-b');hold on;
plot3(xkk{2}(14:16:end),xkk{2}(15:16:end),xkk{2}(16:16:end),'-r');hold on;

grid; axis equal;
xlabel('x (m)');
ylabel('y (m)');
zlabel('z (m)');
title('Trajectory');
figure;
grid on; axis equal;
xlabel('x (m)');
ylabel('y (m)');
zlabel('z (m)');
title('Trajectory');
plot3(xkk{1}(14:16:end),xkk{1}(15:16:end),xkk{1}(16:16:end),'-b');
%legend('Dataset 1', 'Dataset 2', 'Dataset 3', 'Dataset 4');
xkk_final = [xkk{1};xkk{2};xkk{3};xkk{4}];
dlmwrite('~/xkk_1_walter.txt', xkk{1}(1:end));
dlmwrite('~/xkk_2_walter.txt', xkk{2}(1:end));
dlmwrite('~/xkk_3_walter.txt', xkk{3}(1:end));
dlmwrite('~/xkk_4_walter.txt', xkk{4}(1:end));
%dlmwrite('~/xkk_walter_combined.txt', xkk_final(1:150144), ' ');

grid; axis equal;
xlabel('x (m)');
ylabel('y (m)');
zlabel('z (m)');
title('Trajectory');