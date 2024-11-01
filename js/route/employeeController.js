app.controller('employeeController', function ($scope, $http) {
  // Lấy dữ liệu nhân viên từ API
  
  const domain = 'http://localhost:8080';
  const baseUrl = domain+'/api/employee';

  $scope.getEmployees = function () {
    $http.get(`${baseUrl}/getAll`)
      .then(response => $scope.employees = response.data)
      .catch(error => console.error('Lỗi khi lấy danh sách nhân viên:', error));
  };

  $scope.departments = function () {
    $http.get(`${domain}/api/department/getAll`)
      .then(response => $scope.departments = response.data)
      .catch(error => console.error('Lỗi khi lấy danh sách nhân viên:', error));
  };

  $scope.positions = function () {
    $http.get(`${domain}/api/position`)
      .then(response => $scope.positions = response.data)
      .catch(error => console.error('Lỗi khi lấy danh sách nhân viên:', error));
  };

  // Khởi tạo controller
  $scope.init = function () {
    $scope.getEmployees();
    $scope.newEmployee = {};
    $scope.selectedEmployee = {};
    $scope.departments = {};
    $scope.positions = {};
  };
  $scope.init();

  // Mở modal thêm nhân viên
  $scope.openAddModal = () => {
    $scope.newEmployee = {}; // Reset dữ liệu cho nhân viên mới
    $('#addModal').modal('show'); // Hiện modal thêm nhân viên
  };

  // Mở modal cập nhật nhân viên
  $scope.openUpdateModal = (employee) => {
    $scope.selectedEmployee = angular.copy(employee); 
    console.log($scope.selectedEmployee)
    // Sao chép dữ liệu nhân viên để cập nhật
    $('#updateModal').modal('show'); // Hiện modal cập nhật nhân viên
  };

  // Thêm nhân viên
  $scope.addEmployee = () => {
    $http.post(`${baseUrl}/add`, $scope.newEmployee)
      .then(response => {
        $scope.getEmployees(); // Cập nhật danh sách nhân viên
        $('#addModal').modal('hide'); // Đóng modal sau khi thêm
      })
      .catch(error => console.error('Lỗi khi thêm nhân viên:', error));
  };

  // Cập nhật nhân viên
  $scope.updateEmployee = () => {
    $http.put(`${baseUrl}/update/${$scope.selectedEmployee.id}`, $scope.selectedEmployee)
      .then(response => {
        $scope.getEmployees(); // Cập nhật danh sách nhân viên
        $('#updateModal').modal('hide'); // Đóng modal sau khi cập nhật
      })
      .catch(error => console.error('Lỗi khi cập nhật nhân viên:', error));
  };

  // Toggle trạng thái kích hoạt
  $scope.toggleStatus = (employee) => {
    employee.trangthai = employee.trangthai === 'Kích hoạt' ? 'Ngừng kích hoạt' : 'Kích hoạt';
    // Gọi API để cập nhật trạng thái
    $http.put(`${baseUrl}/toggleStatus/${employee.id}`, { status: employee.trangthai })
      .then(response => {
        console.log('Cập nhật trạng thái thành công:', response.data);
      })
      .catch(error => console.error('Lỗi khi cập nhật trạng thái:', error));
  };

  // Preview hình ảnh mới
  $scope.previewNewImage = function () {
    const file = $scope.newEmployee.hinhanhFile;
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $scope.$apply(() => {
          $scope.newEmployee.hinhanh = e.target.result; // Lưu đường dẫn hình ảnh vào newEmployee
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Preview hình ảnh cập nhật
  $scope.previewUpdateImage = function () {
    const file = $scope.selectedEmployee.hinhanhFile;
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $scope.$apply(() => {
          $scope.selectedEmployee.hinhanh = e.target.result; // Lưu đường dẫn hình ảnh vào selectedEmployee
        });
      };
      reader.readAsDataURL(file);
    }
  };
});
