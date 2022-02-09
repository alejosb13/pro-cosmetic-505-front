import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cliente } from 'app/shared/models/Cliente.model';
import { Categoria } from 'app/shared/models/Categoria.models';
import { Frecuencia } from 'app/shared/models/Frecuencia.models';
import { CategoriaService } from 'app/shared/services/categoria.service';
import { ClientesService } from 'app/shared/services/clientes.service';
import { FrecuenciaService } from 'app/shared/services/frecuencia.service';
import { HelpersService } from 'app/shared/services/helpers.service';
import { ValidFunctionsValidator } from 'app/shared/validations/valid-functions.validator';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {

  editarClienteForm: FormGroup;
  Categorias:Categoria[]
  Frecuencias:Frecuencia[]
  daysOfWeek:string[]
  
  @ViewChild('diasCobro') diasCobroInput: ElementRef;
  @Input() clienteId?:number
  @Output() FormsValues = new EventEmitter<Cliente>();
  
  constructor(
    private fb: FormBuilder,
    private _CategoriaService: CategoriaService,
    private _ClientesService: ClientesService,
    private _FrecuenciaService: FrecuenciaService,
    private _HelpersService: HelpersService,
    
  ) { 
    this._CategoriaService.getCategoria().subscribe((data:Categoria[]) => this.Categorias = [...data]);
    this._FrecuenciaService.getFrecuencia().subscribe((data:Frecuencia[]) => this.Frecuencias = [...data]);
    
    this.daysOfWeek = this._HelpersService.DaysOfTheWeek
    
  }

  ngOnInit(): void {
    
    this.definirValidaciones()
    
    if(this.clienteId) this.setFormValues()
  }
  
  definirValidaciones(){
    this.editarClienteForm = this.fb.group(
      {
        categoria_id: [
          '',
          Validators.compose([
            Validators.required,        

          ]),
        ],
        frecuencia_id: [
          '',
          Validators.compose([
            Validators.required,
            // Validators.min(2000),
            // Validators.max(this.anioActual),

          ]),
        ],
        nombre: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(80),
            Validators.minLength(3),
          ]),
        ],
        apellido: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(80),
            Validators.minLength(3),
          ]),
        ],
        cedula: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(ValidFunctionsValidator.NumberRegEx),    
            Validators.maxLength(12),
          ]),
        ],
        celular: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(ValidFunctionsValidator.NumberRegEx),    
            Validators.maxLength(11),
            
            // Validators.maxLength(12),
          ]),
        ],
        telefono: [
          '',
          Validators.compose([
            Validators.pattern(ValidFunctionsValidator.NumberRegEx),    
            Validators.maxLength(11),
          ]),
        ],
        direccion_casa: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(180),

          ]),
        ],
        direccion_negocio: [
          '',
          Validators.compose([
            // Validators.required,
            Validators.maxLength(180),
          ]),
        ],

        dias_cobro: this.fb.array(
          [],
          [
            Validators.required
          ]
        ),
        // fecha_vencimiento: [
        //   '',
        //   Validators.compose([
        //     // Validators.required,

        //   ]),
        // ],
        estado: [
          1,
          Validators.compose([
            Validators.required,

          ]),
        ],
      }
    ); 
  }
  
  setFormValues(){
    
    this._ClientesService.getClienteById(this.clienteId).subscribe((cliente:Cliente)=>{
      // console.log(cliente);
      // console.log(cliente.dias_cobro.split(","));
      
      this.editarClienteForm.patchValue({
        "categoria_id" : cliente.categoria_id,
        "frecuencia_id" : cliente.frecuencia_id,
        "nombre" : cliente.nombre,
        "apellido" : cliente.apellido,
        "cedula" : cliente.cedula,
        "celular" : cliente.celular,
        "telefono" : cliente.telefono,
        "direccion_casa" : cliente.direccion_casa,
        "direccion_negocio" : cliente.direccion_negocio,
        // "dias_cobro" : [],
        "estado" : cliente.estado,
      });
      
      let dias_cobro = cliente.dias_cobro.split(",").map((dia)=> this._HelpersService.DaysOfTheWeek.indexOf(dia.toLowerCase())) // obtengo el dia de la semana en numero
      // console.log(dias_cobro);
      
      const formArray: FormArray = this.editarClienteForm.get("dias_cobro") as FormArray; // obtengo el campo del formulario angular
      dias_cobro.map((numberDay:number) => formArray.push(new FormControl(numberDay)) )// ingreso el valor de los dias en el formulario angular
      
      let arrayInput = Array.from(this.diasCobroInput.nativeElement.querySelectorAll('input[type="checkbox"]'))
      arrayInput.map((input: any, i: number) => {
        if (dias_cobro.some((numberDay) => numberDay == input.value)) {
          input.setAttribute('checked', true)
        }
      })

      
    })
            

    

  }
  
  changeValueFormArray({ name, value, checked }) {
    const formArray: FormArray = this.editarClienteForm.get(name) as FormArray;

    if (checked) {
      formArray.push(new FormControl(value));
    } else {
      const index = formArray.controls.findIndex(x => x.value === value);
      formArray.removeAt(index);
    }
  }
  
  get formularioControls(){
    return this.editarClienteForm.controls
  }


  EnviarFormulario(){
    // console.log(this.editarClienteForm);
    // console.log(this.formularioControls);
    // console.log(this.editarClienteForm.getRawValue());
    
    if(this.editarClienteForm.valid){
      let cliente = {} as Cliente
      cliente.nombre            = this.formularioControls.nombre.value
      cliente.apellido          = this.formularioControls.apellido.value
      cliente.categoria_id      = Number(this.formularioControls.categoria_id.value)
      cliente.cedula            = this.formularioControls.cedula.value
      cliente.celular           = Number(this.formularioControls.celular.value)
      cliente.dias_cobro        = this._HelpersService.daysOfTheWeekToString(this.formularioControls.dias_cobro.value)
      cliente.direccion_casa    = this.formularioControls.direccion_casa.value
      cliente.direccion_negocio = this.formularioControls.direccion_negocio.value
      cliente.estado            = Number(this.formularioControls.estado.value)
      cliente.frecuencia_id     = Number(this.formularioControls.frecuencia_id.value)
      cliente.telefono          = Number(this.formularioControls.telefono.value)
    
      this.FormsValues.emit(cliente)
    }else{
      Swal.fire({
        text: "Complete todos los campos obligatorios",
        icon: 'warning',
      })
    }
    
  }
}