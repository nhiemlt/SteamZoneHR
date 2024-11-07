app.controller('employeeController', function ($scope, $http) {
  const domain = 'http://localhost:8080';
  const baseUrl = `${domain}/api/employee`;

  // Khởi tạo các biến và danh sách
  $scope.employees = [];
  $scope.departments = [];
  $scope.positions = [];
  $scope.newEmployee = {};
  $scope.selectedEmployee = {};

  // Hàm lấy danh sách nhân viên
  $scope.getEmployees = function () {
    $http.get(`${baseUrl}/getAll`)
      .then(response => {
        $scope.employees = response.data
          .map(employee => {
            employee.birthDate = employee.birthDate ? new Date(employee.birthDate) : null;
            return employee;
          })
          .sort((a, b) => b.id - a.id); // Sắp xếp giảm dần theo ID
          $scope.filteredEmployees = $scope.employees;
      })
      .catch(error => console.error('Lỗi khi lấy danh sách nhân viên:', error));
  }

  // Hàm lấy danh sách phòng ban
  $scope.getDepartments = function () {
    $http.get(`${domain}/api/department/getAll`)
      .then(response => $scope.departments = response.data)
      .catch(error => console.error('Lỗi khi lấy danh sách phòng ban:', error));
  };

  // Hàm lấy danh sách chức vụ
  $scope.getPositions = function () {
    $http.get(`${domain}/api/position`)
      .then(response => $scope.positions = response.data)
      .catch(error => console.error('Lỗi khi lấy danh sách chức vụ:', error));
  };

  $scope.getData = function (positionId, departmentId) {
    return $http.get(`${domain}/api/PositionDepartment/get-by-position-and-department`, {
      params: { departmentId: departmentId, positionId: positionId }
    })
      .then(response => {
        if (!response.data) {
          console.error('Không có dữ liệu.');
          return null;
        } else {
          const id = response.data.id;
          console.log("ID: ", id);
          return id;
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy dữ liệu:', error);
        return null;
      });
  };

  $scope.$watch('searchText', function (newValue) {
    if (!newValue) {
      // Nếu không có từ khóa tìm kiếm, hiển thị toàn bộ danh sách
      $scope.filteredEmployees = $scope.employees;
    } else {
      // Lọc danh sách dựa trên từ khóa tìm kiếm
      $scope.filteredEmployees = $scope.employees.filter(employee =>
        employee.fullName.toLowerCase().includes(newValue.toLowerCase())
      );
    }
    console.log($scope.filteredEmployees)
  });

  $scope.showErrorModal = function (message) {
    $scope.errorMessage = message;
    var errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
  };

  $scope.showSuccessModal = function (message) {
    $scope.successMessage = message;
    var successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
  };


  // Hàm khởi tạo
  $scope.init = function () {
    $scope.getEmployees();
    $scope.getDepartments();
    $scope.getPositions();
  };

  $scope.init();

  // Mở modal thêm nhân viên
  $scope.openAddModal = function () {
    $scope.newEmployee = {};
    $('#addModal').modal('show');
  };

  // Mở modal cập nhật nhân viên
  $scope.openUpdateModal = function (employee) {
    $scope.selectedEmployee = angular.copy(employee);
    console.log("Selected employee", $scope.selectedEmployee);
    $('#updateModal').modal('show');
  };

  // Thêm nhân viên
  $scope.addEmployee = function () {
    $scope.getData($scope.newEmployee.position, $scope.newEmployee.department).then((positionDepartmentID) => {
      if (!positionDepartmentID) {
        $('#addModal').modal('hide'); // Đóng modal
        $scope.showErrorModal("Không tìm thấy phòng ban hoặc chức vụ");
        return;
      }

      const employeeData = {
        positionDepartmentID: positionDepartmentID,
        fullName: $scope.newEmployee.fullName,
        gender: $scope.newEmployee.gender, // Chuyển đổi giới tính
        birthDate: $scope.newEmployee.birthDate,
        email: $scope.newEmployee.email,
        phoneNumber: $scope.newEmployee.phoneNumber,
        idcardNumber: $scope.newEmployee.IDCardNumber,
        address: $scope.newEmployee.address,
        avatarURL: $scope.newEmployee.avatarURL || null, // Xử lý URL hình ảnh
        password: "abc123" // Nếu có trường mật khẩu
      };

      console.log(employeeData);

      $http.post(`${baseUrl}/createEmployee`, employeeData)
        .then(response => {
          console.log('Nhân viên đã được thêm thành công:', response.data);
          $scope.getEmployees(); // Cập nhật lại danh sách nhân viên
          $('#addModal').modal('hide'); // Đóng modal
          $scope.showSuccessModal("Thêm nhân viên thành công"); // Hiển thị modal thông báo thành công
        })
        .catch(error => console.error('Lỗi khi thêm nhân viên:', error));
    });
  };


  // Cập nhật thông tin nhân viên
  $scope.updateEmployee = function () {
    // Lấy positionDepartmentID từ API
    $scope.getData($scope.selectedEmployee.positionDepartmentID.positionID.id, $scope.selectedEmployee.positionDepartmentID.departmentID.id)
      .then(positionDepartmentID => {
        console.log("SELETED: ", positionDepartmentID);

        if (positionDepartmentID == null) {
          $('#updateModal').modal('hide'); // Đóng modal
          $scope.showErrorModal("Thông tin phòng ban - chức vụ đang chọn chưa tồn tại");
        } else {
          // Chuẩn bị dữ liệu employee để gửi lên server
          const employeeData = {
            id: $scope.selectedEmployee.id,
            positionDepartmentID: positionDepartmentID,
            fullName: $scope.selectedEmployee.fullName,
            gender: $scope.selectedEmployee.gender,
            birthDate: $scope.selectedEmployee.birthDate,
            email: $scope.selectedEmployee.email,
            phoneNumber: $scope.selectedEmployee.phoneNumber,
            idcardNumber: $scope.selectedEmployee.IDCardNumber,
            address: $scope.selectedEmployee.address,
            avatarURL: $scope.selectedEmployee.avatarURL || null,
          };

          console.log(employeeData);

          // Gửi yêu cầu cập nhật nhân viên
          $http.put(`${baseUrl}/updateEmployee`, employeeData)
            .then(response => {
              console.log('Cập nhật nhân viên thành công:', response.data);
              $scope.getEmployees(); // Cập nhật lại danh sách nhân viên
              $('#updateModal').modal('hide'); // Đóng modal
              $scope.showSuccessModal("Cập nhật nhân viên thành công");
            })
            .catch(error => console.error('Lỗi khi cập nhật nhân viên:', error));
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy positionDepartmentID:', error);
        $scope.showErrorModal("Lỗi khi lấy dữ liệu phòng ban hoặc chức vụ");
      });
  };


  // Chuyển đổi trạng thái nhân viên
  $scope.toggleStatus = function (employee) {
    employee.isActive = !employee.isActive;
    $http.put(`${baseUrl}/updateActiveEmployee/${employee.id}`, { isActive: employee.isActive })
      .then(response => {
        console.log('Cập nhật trạng thái thành công:', response.data);
      })
      .catch(error => console.error('Lỗi khi cập nhật trạng thái:', error));
  };

  // Xem trước hình ảnh cho thêm nhân viên
  $scope.previewNewImage = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $scope.$apply(() => {
          $scope.newEmployee.avatarURL = e.target.result;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Xem trước hình ảnh cho cập nhật nhân viên
  $scope.previewUpdateImage = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $scope.$apply(() => {
          $scope.selectedEmployee.avatarURL = e.target.result;
        });
      };
      reader.readAsDataURL(file);
    }
  };
});
