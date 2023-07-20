import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/auth/login/service/auth.service';
import { Cliente } from 'app/shared/models/Cliente.model';
import { TypesFiltersForm } from 'app/shared/models/FiltersForm';
import { FiltrosList, Link, ListadoModel } from 'app/shared/models/Listados.model';
import { Usuario, UsuarioProductos } from 'app/shared/models/Usuario.model';
import { HelpersService } from 'app/shared/services/helpers.service';
import { Listado } from 'app/shared/services/listados.service';
import { RememberFiltersService } from 'app/shared/services/remember-filters.service';
import { UsuariosService } from 'app/shared/services/usuarios.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios-productos',
  templateUrl: './usuarios-productos.component.html',
  styleUrls: ['./usuarios-productos.component.css']
})
export class UsuariosProductosComponent implements OnInit {
  UsuarioProductos: UsuarioProductos[];

  isLoad: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  userId: number;
  status_pagado: number =3;

  userIdString: string;
  userStore: Usuario[];
  USersNames: string[] = [];

  diasCobros: string[] = [];

  dateIni: string;
  dateFin: string;
  allDates: boolean = true;

  roleName: string;
  listadoData: ListadoModel<UsuarioProductos>;
  listadoFilter: FiltrosList = { link: null };

  FilterSection: TypesFiltersForm = "clientesHistorialFilter";

  private Subscription = new Subscription();

  daysOfWeek: string[];

  constructor(
    private _Listado: Listado,
    private _AuthService: AuthService,
    private NgbModal: NgbModal,
    private _UsuariosService: UsuariosService,
    private _RememberFiltersService: RememberFiltersService,
    private _HelpersService: HelpersService,

  ) {
    // this.UsuarioId = Number(route.snapshot.params.id);
  }

  ngOnInit(): void {
    this.isAdmin = this._AuthService.isAdmin();
    this.isSupervisor = this._AuthService.isSupervisor();
    this.roleName = String(this._AuthService.dataStorage.user.roleName);
    

    this.daysOfWeek = this._HelpersService.DaysOfTheWeek;

    this.setCurrentDate();
    this.getUsers();
    this.aplicarFiltros();
  }

  getUsers() {
    this._UsuariosService.getUsuario().subscribe((usuarios: Usuario[]) => {
      this.userStore = usuarios;
      this.USersNames = usuarios.map(
        (usuario) => `${usuario.id} - ${usuario.name} ${usuario.apellido}`
      );
    });
  }

  cortarLetrasYMayuscula(
    palabra: string,
    posicionIni: number,
    posicionfin: number
  ) {
    let texto = palabra.slice(posicionIni, posicionfin);

    return `${texto.charAt(posicionIni).toUpperCase()}${texto.slice(1)}`;
  }

  descargarPDF() {

    if(this.UsuarioProductos.length == 0){
      Swal.fire(
        '',
        'No posee registros para descargar',
        'warning'
      )
      return false
    }

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${day}-${month}-${year}`;

    Swal.fire({
      title: "Descargando el archivo",
      text: "Esto puede demorar un momento.",
      timerProgressBar: true,
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    this._Listado.productosVendidosPDF(this.listadoFilter).subscribe((data)=>{
      // console.log(data);
      this._HelpersService.downloadFile(data,`Detalle_Factura_${currentDate}`)
      Swal.fire(
        '',
        'Descarga Completada',
        'success'
      )
    })
  }

  descargarCSV() {
    this._Listado.registerClientesCSV(this.listadoFilter);
  }
  
  existeDiaDeCobroEnFiltro(dia:string) {
    return this.diasCobros.some((diaCobro)=> diaCobro == dia)
  }

  clearDiasCobros() {
    let element = document.getElementById('diasCobrosElement') as HTMLElement;
    let lisInputs = element.getElementsByTagName('input')
    Array.from(lisInputs).map((input:HTMLInputElement)=>{
      input.checked = false
    })
  }

  asignarValores() {
    this.isLoad = true;

    this.listadoFilter = {
      ...this.listadoFilter,
      roleName: this.roleName,
    };

    let Subscription = this._Listado.productoUsuarioList(this.listadoFilter).subscribe(
      (Paginacion) => {
        this.listadoData = { ...Paginacion };
        this.UsuarioProductos = [...Paginacion.data]

        // this.Clientes = [...Paginacion.data];
        this.isLoad = false;
      },
      (error) => {
        this.isLoad = false;
      }
    );
    this.Subscription.add(Subscription);
  }

  BuscarValor() {
    this.listadoFilter.link = null;
    this.asignarValores();
  }

  openFiltros(content: any) {
    // console.log(this.mesNewMeta);
    this.listadoFilter.link = null;

    this.NgbModal.open(content, {
      ariaLabelledBy: "modal-basic-title",
    }).result.then(
      (result) => {},
      (reason) => {}
    );
  }

  newPage(link: Link) {
    if (link.url == null) return;
    // console.log(link);

    this.listadoFilter.link = link.url;

    this.asignarValores();
  }

  setCurrentDate() {
    let current = this._HelpersService.changeformatDate(
      this._HelpersService.currentDay(),
      "MM/DD/YYYY",
      "YYYY-MM-DD"
    );
    let month = this._HelpersService.changeformatDate(
      this._HelpersService.currentDay(),
      "MM/DD/YYYY",
      "MM"
    );
    let year = this._HelpersService.changeformatDate(
      this._HelpersService.currentDay(),
      "MM/DD/YYYY",
      "YYYY"
    );
    let rangoMonth = this._HelpersService.InicioYFinDeMes(current);

    this.dateIni = `${year}-${month}-01`;
    this.dateFin = `${year}-${month}-${rangoMonth.ultimoDiaDelMes}`;

    this.listadoFilter = {
      ...this.listadoFilter,
      dateIni: this.dateIni,
      dateFin: this.dateFin,
    };
  }

  limpiarFiltros() {
    this.setCurrentDate();
    this.clearDiasCobros();
    this.allDates = false;
    this.diasCobros = [];
    this.status_pagado = 3;
    

    this._RememberFiltersService.deleteFilterStorage(this.FilterSection);
    this.aplicarFiltros();

    // console.log(this.filtros);
  }

  aplicarFiltros(submit: boolean = false) {
    // console.log(this.allDates);
    let filtrosStorage = this._RememberFiltersService.getFilterStorage();

    if (filtrosStorage.hasOwnProperty(this.FilterSection) && !submit) {
      // solo al iniciar con datos en storage
      this.listadoFilter = { ...filtrosStorage[this.FilterSection] };
      this.userId = Number(this.listadoFilter.userId);
      // this.categoriaId = Number(this.listadoFilter.categoriaId);
      this.dateIni = this.listadoFilter.dateIni;
      this.dateFin = this.listadoFilter.dateFin;
      this.allDates = this.listadoFilter.allDates;
      this.status_pagado = Number(this.listadoFilter.status_pagado);
      this.diasCobros = this.listadoFilter.diasCobros;
    } else {
      if (!submit) {
        console.log(this.userId);

        this.userId = Number(this._AuthService.dataStorage.user.userId);
        // this.userId = 0;
        // this.categoriaId = 0;
      }

      if (!this.dateIni || !this.dateFin) this.setCurrentDate(); // si las fechas estan vacias, se setean las fechas men actual

      if (
        this._HelpersService.siUnaFechaEsIgualOAnterior(
          this.dateIni,
          this.dateFin
        )
      )
        this.setCurrentDate(); // si las fecha inicial es mayor a la final, se setean las fechas mes actual
      this.listadoFilter = {
        ...this.listadoFilter,
        dateIni: this.dateIni,
        dateFin: this.dateFin,
        userId: this.userId,
        // categoriaId: this.categoriaId,
        allDates: this.allDates,
        status_pagado: this.status_pagado,
        diasCobros: this.diasCobros,
      };
    }

    this._RememberFiltersService.setFilterStorage(this.FilterSection, {
      ...this.listadoFilter,
    });
    this.asignarValores();
  }

  eliminar({ id }: Cliente) {
    // console.log(id);
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Este cliente se eliminará y no podrás recuperarlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#51cbce",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // this._ClientesService.deleteCliente(id).subscribe((data) => {
        //   this.Clientes = this.Clientes.filter((cliente) => cliente.id != id);

        //   Swal.fire({
        //     text: data[0],
        //     icon: "success",
        //   });
        // });
      }
    });
  }

  ngOnDestroy() {
    this.Subscription.unsubscribe();
  }
}