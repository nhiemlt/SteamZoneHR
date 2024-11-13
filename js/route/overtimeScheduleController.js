app.controller('overtimeScheduleController', function ($scope, $http) {
  const domain = 'http://localhost:8080';
  const baseUrl = `${domain}/api/employee`;

  // Khởi tạo các biến và danh sách
  $scope.employees = [];
  $scope.selectedSchedule = {};
  // Hàm lấy danh sách nhân viên
  $scope.getEmployees = function () {
    $http.get(`${baseUrl}/getAll`)
      .then(response => {
        $scope.employees = response.data.map(employee => {
          employee.birthDate = employee.birthDate ? new Date(employee.birthDate) : null;
          return employee;
        });
      })
      .catch(error => console.error('Lỗi khi lấy danh sách nhân viên:', error));
  };

  $scope.filterEmployees = function () {
    const { scheduleDate, startTime, endTime } = $scope.selectedSchedule;
    console.log($scope.selectedSchedule);
    
    // Nếu chưa có ngày hoặc giờ, hiển thị tất cả nhân viên
    if (!scheduleDate || !startTime || !endTime) {
      return;
    }
  };

  // Hàm khởi tạo
  $scope.init = function () {
    $scope.getEmployees();
  };

  $scope.init();
  // Trạng thái của checkbox 'Chọn tất cả'
  $scope.selectAll = false;

  // Hàm toggle select all
  $scope.toggleSelectAll = function () {
    // Lặp qua tất cả nhân viên và thiết lập trạng thái selected theo giá trị của selectAll
    angular.forEach($scope.employees, function (employee) {
      employee.selected = $scope.selectAll;
    });
  };

  // Hàm mở modal cập nhật
  $scope.openUpdateModal = function (employee) {
    $scope.selectedEmployee = angular.copy(employee); // Lưu thông tin nhân viên vào biến selectedEmployee
  };

  // Hàm cập nhật lịch làm thêm
  $scope.updateSchedule = function () {
    console.log('Cập nhật lịch làm thêm:', $scope.selectedEmployee);
    // Logic cập nhật lịch ở đây
    $('#updateModal').modal('hide');  // Đóng modal
  };
});
