<<<<<<< HEAD
angular.module('app').controller('positionController', function ($scope, $http) {
    // Khởi tạo dữ liệu
    $scope.positions = []; // Danh sách chức vụ
    $scope.departments = []; // Danh sách phòng ban
    $scope.newDepartment = {}; // Dữ liệu phòng ban mới
    $scope.selectedDepartment = null; // Phòng ban đang được chọn
    $scope.newPosition = {}; // Dữ liệu chức vụ mới
    $scope.selectedPosition = null; // Chức vụ đang được chọn

    // Hàm lấy tất cả phòng ban
    $scope.loadDepartments = function () {
        $http.get('http://192.168.1.19:8080/api/PositionDepartment/getAll')
            .then(function (response) {
                $scope.departments = response.data; // Cập nhật danh sách phòng ban
                console.log($scope.departments);
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm lấy tất cả chức vụ
    $scope.loadPositions = function () {
        $http.get('http://192.168.1.19:8080/api/position')
            .then(function (response) {
                $scope.positions = response.data; // Cập nhật danh sách chức vụ
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm thêm phòng ban
    $scope.addDepartment = function () {
        $http.post('http://192.168.1.19:8080/api/PositionDepartment/add-position-department', $scope.newDepartment)
            .then(function (response) {
                $scope.departments.push(response.data); // Thêm phòng ban mới vào danh sách
                $scope.clearNewDepartment(); // Reset form
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm cập nhật phòng ban
    $scope.updateDepartment = function () {
        if ($scope.selectedDepartment) {
            $http.put(`http://192.168.1.19:8080/api/PositionDepartment/update-position-department/${$scope.selectedDepartment.id}`, $scope.selectedDepartment)
                .then(function (response) {
                    const index = $scope.departments.findIndex(department => department.id === response.data.id);
                    if (index !== -1) {
                        $scope.departments[index] = response.data; // Cập nhật danh sách
                    }
                    $scope.selectedDepartment = null; // Reset lựa chọn
                })
                .catch(function (error) {
                    console.error('Lỗi API:', error); // Xử lý lỗi
                });
        }
    };

    // Hàm thêm chức vụ
    $scope.addPosition = function () {
        $http.post('http://192.168.1.19:8080/api/position', $scope.newPosition)
            .then(function (response) {
                $scope.positions.push(response.data); // Thêm chức vụ mới vào danh sách
                $scope.clearNewPosition(); // Reset form
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm cập nhật chức vụ
    $scope.updatePosition = function () {
        if ($scope.selectedPosition) {
            $http.put(`http://192.168.1.19:8080/api/position/${$scope.selectedPosition.id}`, $scope.selectedPosition)
                .then(function (response) {
                    const index = $scope.positions.findIndex(position => position.id === response.data.id);
                    if (index !== -1) {
                        $scope.positions[index] = response.data; // Cập nhật danh sách
                    }
                    $scope.selectedPosition = null; // Reset lựa chọn
                })
                .catch(function (error) {
                    console.error('Lỗi API:', error); // Xử lý lỗi
                });
        }
    };

    // Hàm xóa phòng ban
    $scope.deleteDepartment = function (departmentId) {
        $http.delete(`http://192.168.1.19:8080/api/PositionDepartment/${departmentId}`)
            .then(function () {
                $scope.loadDepartments(); // Tải lại danh sách sau khi xóa
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm xóa chức vụ
    $scope.deletePosition = function (positionId) {
        $http.delete(`http://192.168.1.19:8080/api/position/${positionId}`)
            .then(function () {
                $scope.loadPositions(); // Tải lại danh sách sau khi xóa
            })
            .catch(function (error) {
                console.error('Lỗi API:', error); // Xử lý lỗi
            });
    };

    // Hàm làm mới thông tin phòng ban
    $scope.clearNewDepartment = function () {
        $scope.newDepartment = {}; // Reset thông tin phòng ban mới
    };

    // Hàm làm mới thông tin chức vụ
    $scope.clearNewPosition = function () {
        $scope.newPosition = {}; // Reset thông tin chức vụ mới
    };

    // Gọi các hàm để tải dữ liệu khi controller khởi tạo
    $scope.loadDepartments();   
    $scope.loadPositions(); 
=======
app.controller("positionController", function ($scope, $http) {
  const baseUrl = "http://localhost:8080/api/departments";
  const baseURLP = "http://localhost:8080/api/positions";
  $scope.departments = [];
  $scope.currentDepartmentPage = 1;
  $scope.departmentItemsPerPage = 10;
  $scope.newDepartment = { departmentName: "", isActive: true };
  $scope.selectedDepartment = {};
  $scope.getDepartments = function () {
    const params = {
      departmentName: $scope.searchDepartmentName || "",
      sort: "departmentName",
      direction: "ASC",
    };

    $http
      .get(baseUrl, { params: params })
      .then((response) => {
        $scope.departments = response.data.slice(
          ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage,
          $scope.currentDepartmentPage * $scope.departmentItemsPerPage
        );
        $scope.totalDepartmentPages = Math.ceil(
          response.data.length / $scope.departmentItemsPerPage
        );
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  };
  $scope.getTotalDepartmentPages = function () {
    // Calculate the total number of pages based on the number of departments and items per page
    return Math.ceil($scope.departments.length / $scope.departmentItemsPerPage);
  };

  // Function to get the paginated departments
  $scope.getPaginatedDepartments = function () {
    var start =
      ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage;
    var end = start + $scope.departmentItemsPerPage;
    return $scope.departments.slice(start, end); // Return the sliced array for the current page
  };

  // Function to change the current page
  $scope.changeDepartmentPage = function (page) {
    if (page >= 1 && page <= $scope.getTotalDepartmentPages()) {
      $scope.currentDepartmentPage = page;
    }
  };
  $scope.openUpdateModal = function (department) {
    $scope.selectedDepartment = angular.copy(department);
    $("#updateDepartmentModal").modal("show");
  };
  $scope.addDepartment = function () {
    if (!$scope.newDepartment.departmentName) {
      Swal.fire("Lỗi", "Tên phòng ban không được để trống.", "error");
      return;
    }
    if (
      !$scope.newDepartment.departmentName ||
      $scope.newDepartment.departmentName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên phòng ban phải có ít nhất 3 ký tự.", "error");
      return;
    }

    $http
      .post(baseUrl, $scope.newDepartment)
      .then((response) => {
        Swal.fire("Thành công", "Thêm phòng ban thành công.", "success");
        $scope.newDepartment = { departmentName: "", isActive: true };
        $scope.getDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể thêm phòng ban.", "error");
      });
  };
  $scope.updateDepartment = function (id) {
    if (!$scope.selectedDepartment.departmentName) {
      Swal.fire("Lỗi", "Tên phòng ban không được để trống.", "error");
      return;
    }
    if (
      !$scope.selectedDepartment.departmentName ||
      $scope.selectedDepartment.departmentName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên phòng ban phải có ít nhất 3 ký tự.", "error");
      return;
    }
    $http
      .put(`${baseUrl}/${id}`, $scope.selectedDepartment)
      .then((response) => {
        Swal.fire("Thành công", "Cập nhật phòng ban thành công.", "success");
        $scope.getDepartments();
        $scope.getActiveDepartments();
        $("#updateDepartmentModal").modal("hide");
        $scope.getDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể cập nhật phòng ban.", "error");
      });
  };

  // Hàm cập nhật trạng thái `isActive` của phòng ban
  $scope.updateDepartmentStatus = function (department) {
    const updatedDepartment = {
      departmentName: department.departmentName,
      isActive: department.isActive,
    };

    $http
      .put(`${baseUrl}/${department.id}/toggle-status`, updatedDepartment)
      .then((response) => {
        Swal.fire(
          "Thành công",
          "Trạng thái phòng ban đã được cập nhật.",
          "success"
        );
        $scope.getDepartments();
        $scope.getActiveDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể cập nhật trạng thái phòng ban.", "error");
      });
  };
  $scope.getDepartments = function () {
    $http.get(baseUrl).then(function (response) {
      $scope.departments = response.data;
    });
  };

  // Cập nhật lại danh sách sau khi xóa
  $scope.deleteDepartment = function (id) {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa phòng ban này?",
      text: "Phòng ban sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // Gửi yêu cầu DELETE đến backend
        $http
          .delete(`${baseUrl}/${id}`)
          .then((response) => {
            // Nếu thành công, hiển thị thông báo thành công
            if (response.data.status === "success") {
              Swal.fire("Thành công", response.data.message, "success");

              // Cập nhật lại danh sách phòng ban
              $scope.getDepartments();
            }
          })
          .catch((error) => {
            let errorMessage = "Không thể xóa phòng ban.";

            // Kiểm tra và hiển thị lỗi dựa trên mã trạng thái HTTP
            if (error.status === 409) {
              // Nếu lỗi là do phòng ban đang được tham chiếu
              errorMessage =
                error.data.message ||
                "Không thể xóa phòng ban này vì có chức vụ đang sử dụng.";
            } else if (error.status === 404) {
              // Nếu không tìm thấy phòng ban
              errorMessage =
                error.data.message || "Không tìm thấy phòng ban với id: " + id;
            } else if (error.status === 500) {
              // Lỗi server
              errorMessage =
                error.data.message ||
                "Có lỗi xảy ra trong quá trình xóa phòng ban.";
            }
            Swal.fire("Lỗi", errorMessage, "error");
          });
      }
    });
  };

  //  chức vụ
  $scope.getActiveDepartments = function () {
    $http
      .get(baseUrl + "/active")
      .then(function (response) {
        $scope.activeDepartments = response.data;
        console.log($scope.activeDepartments);
      })
      .catch(function (error) {
        Swal.fire("Lỗi", "Không thể lấy danh sách phòng ban.", "error");
      });
  };
  $scope.getDepartments();
  $scope.getActiveDepartments();
>>>>>>> 8e7ca87ea73177e305db4adff195abb698160f63
});
