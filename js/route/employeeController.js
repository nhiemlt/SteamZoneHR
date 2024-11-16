app.controller("employeeController", function ($scope, $http, $location) {
  const domain = "http://localhost:8080";
  const baseUrl = domain + "/api/employees";

  $scope.page = 0;
  $scope.size = 10;
  $scope.keyword = "";
  $scope.totalPages = 0;
  // Lấy danh sách nhân viên
  $scope.getEmployees = function () {
    const params = {
      keyword: $scope.keyword || "",
      page: $scope.page,
      size: $scope.size,
    };
    $http
      .get(baseUrl, { params })
      .then((response) => {
        $scope.employees = response.data.content
          .map((employee) => {
            employee.birthDate = employee.birthDate
              ? new Date(employee.birthDate)
              : null;
            return employee;
          })
          .sort((a, b) => b.id - a.id);
        $scope.filteredEmployees = $scope.employees;
        $scope.totalPages = response.data.totalPages;
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách nhân viên:", error);
      });
  };

  $scope.goLeaveRecord = function (employeeId) {
    // Điều hướng tới trang chi tiết nhân viên dựa trên ID
    $location.path(`/leave-records/${employeeId}`);
  };

  // Chuyển đến trang mới
  $scope.goToPage = function (pageNumber) {
    if (pageNumber >= 0 && pageNumber < $scope.totalPages) {
      $scope.page = pageNumber;
      $scope.getEmployees(); // Lấy dữ liệu của trang mới
    }
  };
  // Lấy phòng ban và chức vụ
  $scope.getDepartments = function () {
    $http
      .get(`${domain}/api/departments`)
      .then((response) => {
        $scope.departments = response.data;
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách phòng ban:", error);
      });
  };

  $scope.getPositions = function () {
    $http
      .get(`${domain}/api/positions`)
      .then((response) => {
        $scope.positions = response.data;
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách chức vụ:", error);
      });
  };

  // Filter nhân viên theo tên
  $scope.$watch("searchText", function (newValue) {
    if (!newValue) {
      $scope.filteredEmployees = $scope.employees;
    } else {
      $scope.filteredEmployees = $scope.employees.filter((employee) =>
        employee.fullName.toLowerCase().includes(newValue.toLowerCase())
      );
    }
  });

  // Modal thông báo lỗi hoặc thành công
  $scope.showErrorModal = function (message) {
    $scope.errorMessage = message;
    var errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
    errorModal.show();
  };

  $scope.showSuccessModal = function (message) {
    $scope.successMessage = message;
    var successModal = new bootstrap.Modal(
      document.getElementById("successModal")
    );
    successModal.show();
  };

  // Mở modal thêm nhân viên
  $scope.openAddModal = () => {
    $scope.getPositions();
    $scope.newEmployee = {}; // Reset dữ liệu cho nhân viên mới
    $("#addModal").modal("show");
  };

  // Mở modal cập nhật nhân viên
  $scope.openUpdateModal = (employee) => {
    $scope.getDepartments();
    $scope.getPositions();
    $scope.selectedEmployee = angular.copy(employee);
    $("#updateModal").modal("show");
  };

  // Hàm hiển thị hình ảnh trước khi upload
  $scope.previewImage = function (event) {
    const file = event.target.files[0]; // Lấy tệp ảnh từ input file
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Đặt kích thước mới của ảnh (giảm kích thước)
          const MAX_WIDTH = 100;
          const MAX_HEIGHT = 100;
          let width = img.width;
          let height = img.height;

          // Giữ tỉ lệ gốc của ảnh
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Vẽ lại ảnh vào canvas với kích thước mới
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Chuyển canvas thành Base64
          $scope.selectedEmployee.avatarURL = canvas.toDataURL('image/jpeg'); // Lưu Base64 vào avatarURL
          $scope.$apply(); // Cập nhật giao diện
        };
        img.src = e.target.result; // Đọc ảnh từ FileReader
      };
      reader.readAsDataURL(file); // Đọc file ảnh dưới dạng Base64
    }
  };



  $scope.previewNewImage = function (event) {
    const file = event.target.files[0]; // Lấy tệp ảnh từ input file
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Đặt kích thước mới của ảnh (giảm kích thước)
          const MAX_WIDTH = 100;
          const MAX_HEIGHT = 100;
          let width = img.width;
          let height = img.height;

          // Giữ tỉ lệ gốc của ảnh
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Vẽ lại ảnh vào canvas với kích thước mới
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Chuyển canvas thành Base64
          $scope.newEmployee.avatarURL = canvas.toDataURL('image/jpeg'); // Lưu Base64 vào avatarURL
          $scope.$apply(); // Cập nhật giao diện
        };
        img.src = e.target.result; // Đọc ảnh từ FileReader
      };
      reader.readAsDataURL(file); // Đọc file ảnh dưới dạng Base64
    }
  };


  $scope.addEmployee = function () {
    // Kiểm tra các dữ liệu đã có trong danh sách nhân viên
    const existingEmployee = $scope.employees.find(
      (emp) =>
        emp.email === $scope.newEmployee.email ||
        emp.phoneNumber === $scope.newEmployee.phoneNumber ||
        emp.idcardNumber === $scope.newEmployee.idcardNumber
    );

    if (existingEmployee) {
      // Kiểm tra trường nào bị trùng và hiển thị lỗi tương ứng
      if (existingEmployee.email === $scope.newEmployee.email) {
        Swal.fire("Lỗi", "Email đã tồn tại.", "error");
      } else if (existingEmployee.phoneNumber === $scope.newEmployee.phoneNumber) {
        Swal.fire("Lỗi", "Số điện thoại đã tồn tại.", "error");
      } else if (existingEmployee.idcardNumber === $scope.newEmployee.idcardNumber) {
        Swal.fire("Lỗi", "CCCD đã tồn tại.", "error");
      }
      return; // Dừng việc thêm nhân viên nếu có lỗi trùng
    }

    // Kiểm tra các trường thông tin
    if (!$scope.newEmployee.fullName || $scope.newEmployee.fullName.length <= 2) {
      Swal.fire("Lỗi", "Họ tên phải có ít nhất 3 ký tự.", "error");
      return;
    }

    if (
      !$scope.newEmployee.email ||
      !$scope.newEmployee.phoneNumber ||
      !$scope.newEmployee.idcardNumber
    ) {
      Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin.", "error");
      return; // Dừng lại nếu thiếu thông tin
    }

    $scope.newEmployee.avatarFile = $scope.newEmployee.avatarURL || null; // Sử dụng ảnh cũ hoặc null
    saveEmployeeData();

    // Hàm gửi dữ liệu nhân viên lên API
    function saveEmployeeData() {
      const newEmployeeData = {
        fullName: $scope.newEmployee.fullName,
        gender: $scope.newEmployee.gender,
        birthDate: $scope.newEmployee.birthDate,
        address: $scope.newEmployee.address,
        email: $scope.newEmployee.email,
        phoneNumber: $scope.newEmployee.phoneNumber,
        positionID: $scope.newEmployee.positionID,
        idcardNumber: $scope.newEmployee.idcardNumber,
        isActive: $scope.newEmployee.isActive,
        avatarURL: $scope.newEmployee.avatarFile || $scope.newEmployee.avatarURL, // Đảm bảo avatar được gửi đúng
      };

      $http
        .post(baseUrl, newEmployeeData)
        .then((response) => {
          Swal.fire("Thành công", "Thêm nhân viên thành công", "success");
          $scope.getEmployees(); // Cập nhật danh sách nhân viên
          $("#addModal").modal("hide"); // Đóng modal sau khi thêm
        })
        .catch((error) => {
          console.error("Lỗi khi thêm nhân viên:", error);
          Swal.fire("Lỗi", "Có lỗi xảy ra khi thêm nhân viên. Vui lòng thử lại.", "error");
        });
    }
  };


  $scope.updateEmployee = function () {
    const updatedEmployee = {
      id: $scope.selectedEmployee.id,
      fullName: $scope.selectedEmployee.fullName,
      gender: $scope.selectedEmployee.gender,
      birthDate: $scope.selectedEmployee.birthDate,
      address: $scope.selectedEmployee.address,
      email: $scope.selectedEmployee.email,
      phoneNumber: $scope.selectedEmployee.phoneNumber,
      positionID: $scope.selectedEmployee.positionID.id,
      idcardNumber: $scope.selectedEmployee.idcardNumber,
      isActive: $scope.selectedEmployee.isActive,
      avatarURL: $scope.selectedEmployee.avatarFile || $scope.selectedEmployee.avatarURL,
    };

    // Kiểm tra trùng lặp email, số điện thoại, và CCCD
    const existingEmployee = $scope.employees.find(
      (emp) =>
        (emp.email === $scope.selectedEmployee.email && emp.id !== $scope.selectedEmployee.id) ||
        (emp.phoneNumber === $scope.selectedEmployee.phoneNumber && emp.id !== $scope.selectedEmployee.id) ||
        (emp.idcardNumber === $scope.selectedEmployee.idcardNumber && emp.id !== $scope.selectedEmployee.id)
    );

    // Kiểm tra dữ liệu nhập vào
    if (!$scope.selectedEmployee.fullName || $scope.selectedEmployee.fullName.length <= 2) {
      Swal.fire("Lỗi", "Họ tên phải có ít nhất 3 ký tự.", "error");
      return;
    }

    if (existingEmployee) {
      // Kiểm tra trường nào bị trùng và hiển thị lỗi
      if (existingEmployee.email === $scope.selectedEmployee.email) {
        Swal.fire("Lỗi", "Email đã tồn tại.", "error");
      } else if (existingEmployee.phoneNumber === $scope.selectedEmployee.phoneNumber) {
        Swal.fire("Lỗi", "Số điện thoại đã tồn tại.", "error");
      } else if (existingEmployee.idcardNumber === $scope.selectedEmployee.idcardNumber) {
        Swal.fire("Lỗi", "CCCD đã tồn tại.", "error");
      }
      return;
    }

    console.log(updatedEmployee);

    // Gửi yêu cầu cập nhật nhân viên
    $http
      .put(baseUrl + "/" + $scope.selectedEmployee.id, updatedEmployee)
      .then((response) => {
        Swal.fire("Thành công", "Cập nhật nhân viên thành công", "success");
        $scope.getEmployees(); // Cập nhật danh sách nhân viên
        $("#updateModal").modal("hide"); // Đóng modal sau khi cập nhật
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        Swal.fire("Lỗi", "Có lỗi xảy ra khi cập nhật nhân viên. Vui lòng thử lại.", "error");
      });
  };



  // xoá nhân viên
  $scope.deleteEmployee = function (employeeId) {
    // Show SweetAlert2 confirmation dialog
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa nhân viên này?",
      text: "Sau khi xóa, dữ liệu sẽ không thể phục hồi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the delete request if confirmed
        $http
          .delete(baseUrl + "/" + employeeId)
          .then((response) => {
            Swal.fire("Thành công", response.data, "success");
            $scope.getEmployees(); // Refresh the employee list
          })
          .catch((error) => {
            console.error("Lỗi khi xóa nhân viên:", error);
            Swal.fire("Lỗi", "Có lỗi xảy ra khi xóa nhân viên", "error");
          });
      }
    });
  };

  // cập nhật trạng thái
  $scope.toggleStatus = function (employeeId) {
    $http
      .put(baseUrl + "/" + employeeId + "/toggle-status")
      .then(function (response) {
        console.log("Employee status updated", response.data);
        Swal.fire(
          "Thành công",
          "Cập nhật trạng thái nhân viên thành công",
          "success"
        );
      })
      .catch(function (error) {
        console.error("Error updating status", error);
        Swal.fire("Lỗi", "Có lỗi xảy ra khi cập nhật trạng thái", "error");
      });
  };

  // Khởi tạo dữ liệu
  $scope.init = function () {
    $scope.getEmployees();
    $scope.getDepartments();
    $scope.getPositions();
  };

  $scope.init();
});
